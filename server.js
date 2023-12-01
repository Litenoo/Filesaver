require('dotenv').config();

const express = require("express");
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const methodOverride = require('method-override');
const session = require('express-session');
const multer = require('multer');
const app = express();
const fs = require('fs');
const path = require('path');

const { auth, getProfPic, register, getRecord } = require('./accountFuncs');

app.set({ 'view-engine': 'ejs' });
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));


let db = new sqlite3.Database('./serverdb.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err) } else {
        let query = 'CREATE TABLE IF NOT EXISTS users(id INT PRIMARY KEY NOT NULL,username VARCHAR(255) NOT NULL,password VARCHAR(255) NOT NULL,email VARCHAR(255) NOT NULL)';
        db.run(query);
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public', 'images', 'userProfiles'));
    },
    filename: function (req, file, cb) {
        // Assuming you want to set the filename to the user id with a .jpg extension
        const userId = session.user.id; // Replace this with your actual user ID retrieval logic
        const filename = `${userId}.jpg`;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

app.get('/', isAuth, async (req, res) => {
    let imgRef = path.join('images', 'userProfiles', await getProfPic(session.user.id));
    res.render('index.ejs', {
        name: session.user.username,
        imgRef: imgRef,
    });
});

app.get('/register', isNotAuth, (req, res) => {
    res.render('register.ejs');
});

app.get('/login', isNotAuth, (req, res) => {
    res.render('login.ejs', { message: session.message });
    session.message = null;
});

app.get('/profile', isAuth, async (req, res) => { //move to router
    let picRef = await getProfPic(session.user.id);
    res.render('profile.ejs', { name: session.user.username, imgRef: path.join('images', 'userProfiles', picRef) });
});

app.post('/register', async (req, res) => {
    let output = register(req.body.password, req.body.email, req.body.username);
    if (output === null) {
        res.redirect('/register');
    } else {
        res.redirect('/login')
    }
});

app.post('/login', async (req, res) => {
    let response = await auth(req.body.email, req.body.password);
    if (response.user) {
        session.user = response.user;
        res.redirect('/');
    } else {
        session.message = response.message;
        res.redirect('/login');
    }
});

app.delete('/logout', (req, res) => { //check if this is the best method to make it
    req.session.destroy((err) => {
        session.user = null
        if (err) console.error(err);
        res.redirect('/login');
    });
});


app.put('/profileUpload', upload.single('avatar'), async (req, res) => { //make here change to db, for route :P
    if (req.file) {
        let filename = req.file.filename;
        console.log(req.file);
        db.run(`UPDATE profPics SET pic_reference = ? WHERE user_id = ?`,[filename, session.user.id], (err) => {
            if(err){
                console.error(err);
            }else{
                console.log('Everything went well');
            }
        })
        res.redirect('/');
    } else {
        console.error('Error on fileUpload');
    }
})


function isAuth(req, res, next) {
    if (!session.user) {
        return res.redirect('/login');
    } else {
        next();
    }
}

function isNotAuth(req, res, next) {
    if (session.user) {
        return res.redirect('/');
    } else {
        next();
    }
}

app.listen(3000, () => { console.log(`Server is listening on 3000`) });