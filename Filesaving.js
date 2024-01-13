const express = require('express');
const session = require('express-session');
const multer = require('multer');
const fsProm = require('fs').promises;
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const FMrouter = express.Router();

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
    cb(null, path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`, session.user.expPath));
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

FMrouter.put('/newFolder', isAuth, async (req, res) => {
  const pathF = path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`, session.user.expPath);
  if (!fs.existsSync(path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`))) {
    makeDirection(path.join(__dirname, 'public', 'usersFiles'), `${session.user.id}`);
  }
  makeDirection(pathF, req.body.folderName);
  res.send('Folder created successfully');
  res.end();
});

FMrouter.put('/uploadFile', isAuth, upload.single('fileUpload'), () => {

});

FMrouter.post('/structure', isAuth, async (req, res) => {
  if (session.user.expPath === undefined) { session.user.expPath = ''; }
  if (!fs.existsSync(path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`))) {
    makeDirection(path.join(__dirname, 'public', 'usersFiles'), `${session.user.id}`);
  }
  if (session.user.expPath === undefined || session.user.expPath === '') {
    res.json({ files: await readDir(''), route: `${session.user.id}` });
  } else {
    res.json({ files: await readDir(session.user.expPath), route: `${session.user.id}${session.user.expPath}` });
  }
});

FMrouter.delete('/deleteFiles', isAuth, (req) => {
  req.body.filesToDel.forEach((fileName) => {
    try {
      fs.rmSync(path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`, session.user.expPath, fileName), { recursive: true, force: true });
    } catch (err) {
      console.error(err);
    }
  });
});

FMrouter.post('/pathChange', isAuth, (req, res) => {
  if (req.body.pathUpdt !== undefined) {
    session.user.expPath = path.join(session.user.expPath, '/', req.body.pathUpdt);
  }
  res.end();
});

FMrouter.get('/getForm', isAuth, async (req, res) => {
  res.sendFile(path.join(__dirname, 'forms.json'));
});

FMrouter.post(('/getFile'), async (req, res) => {
  const fileNm = req.body.fileName;
  res.sendFile(path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`, session.user.expPath, fileNm));
});
