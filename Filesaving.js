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

async function readDir(path) {
  if (path === undefined) {
    path = '';
  }
  try {
    const files = await fsProm.readdir(`./public/usersFiles/${session.user.id}${path}`);
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
    cb(null, path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`));
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

FMrouter.put('/newFolder', async (req, res) => {
  const pathF = path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`);
  if (!fs.existsSync(path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`))) {
    makeDirection(path.join(__dirname, 'public', 'usersFiles'), `${session.user.id}`);
  }
  makeDirection(pathF, req.body.folderName);
  res.send('Folder created successfully');
});

FMrouter.put('/uploadFile', upload.single('fileUpload'), () => {

});

FMrouter.post('/structure', async (req, res) => { // Change it to GET request
  console.log('The current session directory is : ', req.body.direction);
  if (!fs.existsSync(path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`))) {
    makeDirection(path.join(__dirname, 'public', 'usersFiles'), `${session.user.id}`);
  }
  res.json({ files: await readDir(req.body.path) });
});

FMrouter.get('/getForm', async (req, res) => { // make json request here
  res.sendFile(path.join(__dirname, 'forms.json'));
});

FMrouter.post('/deleteFiles', (req) => {
  // change to delete
  console.log(req.body.filesToDel);
  req.body.filesToDel.forEach((fileDir) => {
    try {
      // something causes error when user is not logged in
      console.log(path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`, fileDir));
      fs.rmSync(path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`, fileDir), { recursive: true, force: true });
    } catch (err) {
      console.error(err);
    }
  });
});

FMrouter.get('/getRoute', (req,res)=>{
  try{
    if(session.route === undefined){
      session.route = path.join(__dirname, 'usersFiles', `${session.user.id}` );
    }
    res.send(session.route);
  }catch(err){
    console.log(err)
  }
})

FMrouter.get('/userId', (req,res)=>{
  res.send(`${session.user.id}`);
});

/**
 * make changing routes and coming into folders possible
 *  ensure that all functions works correct in directions;
 *  make selected files selection display work correctly allways;
 */
