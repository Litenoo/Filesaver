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
    cb(null, path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`));
  },
  filename: (req, file, cb) => {
    const filePath = req.body.fileName + path.extname(file.originalname);
    cb(null, filePath);
  },
});

const upload = multer({ storage });
session.expPath = '';

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

FMrouter.post('/structure', async (req, res) => { // Change it to GET request or another
  if (!fs.existsSync(path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`))) {
    makeDirection(path.join(__dirname, 'public', 'usersFiles'), `${session.user.id}`);
  }
  if (session.expPath === undefined || session.expPath === '') { // change it
    res.json({ files: await readDir(''), route: `${session.user.id}` });
  } else {
    res.json({ files: await readDir(session.expPath), route: `${session.user.id}${session.expPath}` });
  }
});

FMrouter.post('/pathChange', (req, res) => {
  if (req.body.pathUpdt !== undefined) {
    session.expPath = path.join(session.expPath, '/', req.body.pathUpdt);
  }
  res.end();
});

FMrouter.get('/getForm', async (req, res) => { // make json request here
  res.sendFile(path.join(__dirname, 'forms.json'));
});

FMrouter.post('/deleteFiles', (req) => {
  // change to delete
  req.body.filesToDel.forEach((fileDir) => {
    try {
      // something causes error when user is not logged in
      fs.rmSync(path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`, fileDir), { recursive: true, force: true });
    } catch (err) {
      console.error(err);
    }
  });
});

/**
 *  ERROR when login as another user, then select folder and
 * login as another user the route to folder will be the same on both accounts;
 * 
 * Repair the error which causes its impossible to add files in folders
 *  Probably caused by changed route system;
 * 
 *  ensure that all functions works correct in directions;
 * 
 *  make selected files selection display works correctly allways;
 * 
 *  add option of clicking route fragments in explorer to expolre them back and arrow back to go ..;
 * 
 *  make option of editing file by dblclicking it;
 */
