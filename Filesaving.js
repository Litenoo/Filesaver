const express = require('express');
const FMrouter = express.Router();
const session = require('express-session');
const app = express();
const multer = require('multer');
const fsProm = require('fs').promises;
const fs = require('fs');
const path = require('path');
const sqlite = require('sqlite3').verbose();
const bodyParser = require('body-parser');

app.use(bodyParser.json());


FMrouter.use(express.urlencoded({ extended: false }));

const db = new sqlite.Database('./serverdb.db', sqlite.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('Database connection failed');
    }
})


const storage = multer.diskStorage({
    destination: function async(req, file, cb) {
        if (!fs.existsSync(path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`))) {
            makeDirection(path.join(__dirname, 'public', 'usersFiles'), `${session.user.id}`);
        }
        cb(null, path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`));
    },
    filename: (req, file, cb) => {
        let filePath = req.body.fileName + path.extname(file.originalname);
        let query = 'INSERT INTO usrFiles (user_id, file_reference) VALUES (?,?);';
        db.run(query, [session.user.id, filePath], (err) => {
            if (err) console.error(err);
        });
        console.log(filePath);
        cb(null, filePath);
    },
});

function makeDirection(finalPath, folderName) {
    fs.mkdir(finalPath + '/' + folderName, (err) => {
        if (err) console.error('failed to create directory', err);
    });
}

const upload = multer({ storage: storage });

FMrouter.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

FMrouter.get('/', (req, res) => {
    res.render('fileMenager.ejs', {
        name: session.user.username,
        imgRef: session.imgRef,
    });
});

FMrouter.put('/uploadFile', upload.single('fileUpload'), (req, res) => {

});

FMrouter.put('/newFolder', async (req, res) => {
    let pathF = path.join(__dirname, 'public', 'usersFiles', `${session.user.id}`);
    console.log(req.body.folderName);
    makeDirection(pathF , req.body.folderName);
    res.send('Folder created successfully');
});

FMrouter.put('/deleteFile', upload.single('fileUpload'), (req, res) => { 

});

module.exports = FMrouter;

