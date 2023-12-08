require('dotenv').config();

const express = require("express");
const methodOverride = require('method-override');
const session = require('express-session');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const path = require('path');
const FMRouter = require('./Filesaving')

const { auth, getProfPic, register } = require('./accountFuncs');

app.set({ 'view-engine': 'ejs' });
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use('/fileMenager', FMRouter);



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
        const userId = session.user.id;
        const filename = `${userId}.jpg`;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

app.get('/', isAuth, async (req, res) => {
    res.render('index.ejs', {
        name: session.user.username,
        imgRef: session.imgRef,
    });
});

app.get('/register', isNotAuth, (req, res) => {
    res.render('register.ejs');
});

app.get('/login', isNotAuth, async (req, res) => {
    res.render('login.ejs', {
        message: session.message
    });

    session.message = null;
});

app.get('/profile', isAuth, async (req, res) => {
    res.render('profile.ejs', {
        name: session.user.username,
        imgRef: session.imgRef,
    });
});

app.post('/register', async (req, res) => {
    let output = register(
        req.body.password,
        req.body.email,
        req.body.username
    );

    if (output === null) {
        res.redirect('/register');
    } else {
        res.redirect('/login');
    }
});

app.post('/login', async (req, res) => {
    let response = await auth(req.body.email, req.body.password);
    if (response.user) {
        session.user = response.user;
        session.imgRef = path.join(
            'images',
            'userProfiles',
            await getProfPic(session.user.id)
        );

        res.redirect('/');
    } else {
        session.message = response.message;
        res.redirect('/login');
    }
});

app.delete('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error(err);
    });

    session.user = null;
    res.redirect('/login');
});

app.put('/profileUpload', upload.single('avatar'), async (req, res) => {
    if (req.file) {
        try {
            let filename = req.file.filename;
            console.log(req.file);
            db.run(`UPDATE profPics SET pic_reference = ? WHERE user_id = ?`, [filename, session.user.id], (err) => {
                if (err) { console.error(err) };
            })
            res.redirect('/');
        } catch (err) {
            console.error('Error on fileUpload');
        }
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

module.exports = session;