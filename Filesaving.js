const express = require('express');

const app = express();
const FMrouter = express.Router();
const session = require('express-session');
const multer = require('multer');
const fsProm = require('fs').promises;
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

FMrouter.use(express.json());

function makeDirection(finalPath, folderName) {
  fs.mkdir(`${finalPath}/${folderName}`, (err) => {
    if (err) console.error('failed to create directory', err);
  });
}
async function readDir(folderPath) {
  try {
    const files = await fsProm.readdir(`./public/usersFiles/${session.user.id}${folderPath}`);
    return files;
  } catch (err) {
    console.error(err);
  }
}

function isAuth(req, res, next) {
  if (!session.user) {
    return res.redirect('/login');
  }
  next();
}

module.exports = FMrouter;
// Setup

app.use(bodyParser.json());
FMrouter.use(express.urlencoded({ extended: false }));

FMrouter.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));

const storage = multer.diskStorage({
  destination: function async(req, file, cb) {
    if (!fs.existsSync(path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`))) {
      makeDirection(path.join(__dirname, 'public', 'usersFiles'), `${session.user.id}`);
    }
    cb(null, path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`, session.user.expPath)); //edit
  },
  filename: (req, file, cb) => {
    const filePath = req.body.fileName + path.extname(file.originalname);
    cb(null, filePath);
  },
});

const upload = multer({ storage });

// Routing

FMrouter.get('/', isAuth, (req, res) => {
  res.render('fileMenager.ejs', {
    name: session.user.username,
    imgRef: session.imgRef,
    userId: session.user.id,
  });
});

FMrouter.put('/newFolder',isAuth , async (req, res) => {
  const pathF = path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`, session.user.expPath);
  if (!fs.existsSync(path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`))) {
    makeDirection(path.join(__dirname, 'public', 'usersFiles'), `${session.user.id}`);
  }
  makeDirection(pathF, req.body.folderName);
  res.send('Folder created successfully');
});

FMrouter.put('/uploadFile', isAuth, upload.single('fileUpload'), () => {

});

FMrouter.post('/structure', isAuth, async (req, res) => { // Change it to GET request or another
  if(session.user.expPath === undefined){session.user.expPath = ''};
  console.log(session.user.id , session.user.expPath);
  if (!fs.existsSync(path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`))) {
    makeDirection(path.join(__dirname, 'public', 'usersFiles'), `${session.user.id}`);
  }
  if (session.user.expPath === undefined || session.user.expPath === '') { // change it
    res.json({ files: await readDir(''), route: `${session.user.id}` });
  } else {
    res.json({ files: await readDir(session.user.expPath), route: `${session.user.id}${session.user.expPath}` });
  }
});

FMrouter.post('/pathChange', isAuth, (req, res) => {
  if (req.body.pathUpdt !== undefined) {
    if(req.body.pathUpdt === '..'){
      session.user.expPath = path.join(session.user.expPath, '/..');
    }else{
      session.user.expPath = path.join(session.user.expPath, '/', req.body.pathUpdt);
    }
    console.log('path change called the new path is : ' , session.user.expPath);
  }
  res.end();
});

FMrouter.get('/getForm', isAuth, async (req, res) => { // make json request here
  res.sendFile(path.join(__dirname, 'forms.json'));
});

FMrouter.post('/deleteFiles', isAuth, (req) => {
  // change to delete
  req.body.filesToDel.forEach((fileName) => {
    try {
      // something causes error when user is not logged in
      console.log(fileName);
      fs.rmSync(path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`,session.user.expPath, fileName), { recursive: true, force: true });
    } catch (err) {
      console.error(err);
    }
  });
});

FMrouter.post(('/getFile'), async (req, res)=>{
  let fileName = req.body.fileName;
  console.log(path.join(__dirname, 'public','usersFiles',`${session.user.id}`, session.user.expPath, fileName))
  res.sendFile(path.join(__dirname, 'public','usersFiles',`${session.user.id}`, session.user.expPath, fileName))
});

/**
 *  make option of displaying file by dblclicking it;
 * 
 *  Write some tests
 */