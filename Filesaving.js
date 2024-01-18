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

async function readDir(folderPath, sess) {
  try {
    const files = await fsProm.readdir(`./public/usersFiles/${sess}${folderPath}`); //cant do req.session which is needed
    return files;
  } catch (err) {
    console.error(err);
  }
}

function isAuth(req, res, next) {
  if (!req.session.user) {
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
    if (!fs.existsSync(path.join(__dirname, 'public', 'usersFiles', `${req.session.user.id}`))) {
      makeDirection(path.join(__dirname, 'public', 'usersFiles'), `${req.session.user.id}`);
    }
    cb(null, path.join(__dirname, 'public', 'usersFiles', `${req.session.user.id}`, req.session.user.expPath));
  },
  filename: (req, file, cb) => {
    const filePath = req.body.fileName + path.extname(file.originalname);
    cb(null, filePath);
  },
});

const upload = multer({ storage });

// Routing

FMrouter.get('/', isAuth, (req, res, next) => {
  res.render('fileMenager.ejs', {
    name: req.session.user.username,
    imgRef: req.session.imgRef,
    userId: req.session.user.id,
  });
});

FMrouter.put('/newFolder', isAuth, async (req, res) => {
  const pathF = path.join(__dirname, 'public', 'usersFiles', `${req.session.user.id}`, req.session.user.expPath);
  if (!fs.existsSync(path.join(__dirname, 'public', 'usersFiles', `${req.session.user.id}`))) {
    makeDirection(path.join(__dirname, 'public', 'usersFiles'), `${req.session.user.id}`);
  }
  makeDirection(pathF, req.body.folderName);
  res.send('Folder created successfully');
  res.end();
});

FMrouter.put('/uploadFile', isAuth, upload.single('fileUpload'), () => {

});

FMrouter.post('/structure', isAuth, async (req, res) => {
  if (req.session.user.expPath === undefined) { req.session.user.expPath = ''; }
  if (!fs.existsSync(path.join(__dirname, 'public', 'usersFiles', `${req.session.user.id}`))) {
    makeDirection(path.join(__dirname, 'public', 'usersFiles'), `${req.session.user.id}`);
  }
  if (req.session.user.expPath === undefined || req.session.user.expPath === '') {
    res.json({ files: await readDir('', req.session.user.id), route: `${req.session.user.id}` });
  } else {
    res.json({ files: await readDir(req.session.user.expPath, req.session.user.id), route: `${req.session.user.id}${req.session.user.expPath}` });
  }
});

FMrouter.delete('/deleteFiles', isAuth, (req) => {
  req.body.filesToDel.forEach((fileName) => {
    try {
      fs.rmSync(path.join(__dirname, 'public', 'usersFiles', `${req.session.user.id}`, req.session.user.expPath, fileName), { recursive: true, force: true });
    } catch (err) {
      console.error(err);
    }
  });
});

FMrouter.post('/pathChange', isAuth, (req, res) => {
  if (req.body.pathUpdt !== undefined) {
    req.session.user.expPath = path.join(req.session.user.expPath, '/', req.body.pathUpdt);
  }
  res.end();
});

FMrouter.get('/getForm', isAuth, async (req, res) => {
  res.sendFile(path.join(__dirname, 'forms.json'));
});

FMrouter.post(('/getFile'), async (req, res) => {
  const fileNm = req.body.fileName;
  res.sendFile(path.join(__dirname, 'public', 'usersFiles', `${req.session.user.id}`, req.session.user.expPath, fileNm));
});
