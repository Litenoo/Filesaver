require('dotenv').config();

const express = require("express");
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('express-flash');
const app = express();
const fs = require('fs');
const path = require('path')

<<<<<<< HEAD
let db = new sqlite3.Database('./mydatabase.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err) } else {
        let query = 'CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, username VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(255))';
        db.run(query);
    }
})
app.use(methodOverride('_method'));

initAuth(
    passport,
    function getUserByEmail(email) { // async/await
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM users WHERE email = '${email}'`, [], (err, user) => {
                if (err) {
                    reject(err.message);
                } else {
                    resolve(user);
                }
            })
        })
    },
    id => db.get(`SELECT * FROM users WHERE id = '${id}'`, [], (err, user) => {
        if (err) {
            console.error(err.message);
        } else {
            return user;
        }
    })
)
=======
const router1 = require('./routes.js');
const { auth, dbRun, getRecord, getProfPic } = require('./functions');
>>>>>>> 333eae3f3e2c874fa2ff75db9e8759e7db44df99

app.set({ 'view-engine': 'ejs' });
app.use(methodOverride('_method'));
app.use(flash());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
<<<<<<< HEAD
app.use(passport.initialize());
app.use(passport.session());
app.use((req,res,next)=>{
    res.locals.req = req;
    next();
})

app.get('/', (req, res) => {
    if (req.user) { 
        console.log('The req.session is: ', req.user);
        res.render('index.ejs', { name: req.user });
    } else {
        res.redirect('/login');
    }
});

//make router
app.get('/fileMenager', (req, res) => {
    if (req.user) {
        res.render('index.ejs', { name: req.user.username });
    } else {
        res.redirect('login');
=======



let db = new sqlite3.Database('./serverdb.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err) } else {
        let query = 'CREATE TABLE IF NOT EXISTS users(id INT PRIMARY KEY NOT NULL,username VARCHAR(255) NOT NULL,password VARCHAR(255) NOT NULL,email VARCHAR(255) NOT NULL)';
        db.run(query);
>>>>>>> 333eae3f3e2c874fa2ff75db9e8759e7db44df99
    }
});

app.get('/', async (req, res) => {
    if (session.user) {
        let picRef = await getProfPic(session.user.id);
        res.render('index.ejs', { name: session.user.username, imgRef: path.join('images', 'userProfiles', picRef) });
    } else {
        res.redirect('/login');
    }
});

app.get('/register', (req, res) => {
    if (req.user) {
        res.redirect('/');
    } else {
        res.render('register.ejs');
    }
});

app.get('/login', (req, res) => {
<<<<<<< HEAD
    if(checkLogged(req)){
        res.redirect('/');
        return 0;
    }
    let error = req.flash().error;
    res.render('login.ejs', { error });
})

app.post('/register', async (req, res) => {
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    let query = `INSERT INTO users (username, email, password) VALUES ('${req.body.username}', '${req.body.email}', '${hashedPass}')`;
    db.run(query);
    res.redirect('/login');
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
},(req,res)=>{
    console.log(req.user)
}))
=======
    let error = req.flash().error;
    res.render('login.ejs', { error });
});

app.get('/profile', async (req, res) => { //move to router
    if (session.user) {
        let picRef = await getProfPic(session.user.id);
        res.render('profile.ejs', { name: session.user.username, imgRef: path.join('images', 'userProfiles', picRef) });
    } else {
        res.redirect('/login');
    }
});

app.post('/register', async (req, res) => {
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    let query = `INSERT INTO users (username, email, password) VALUES (?,?,?)`;
    db.run(query, [req.body.username, req.body.email, hashedPass], (err) => {
        if (err) {
            res.redirect('/register');
        } else {
            res.redirect('/login');
        }
    });
});

app.post('/login', async (req, res) => {
    let response = await auth(req.body.email, req.body.password);
    if (response.user) {
        session.user = response.user;
        res.redirect('/');
    } else {
        res.redirect('login');
    }
});
>>>>>>> 333eae3f3e2c874fa2ff75db9e8759e7db44df99

app.delete('/logout', (req, res) => {
    req.session.destroy((err)=>{
        session.user = null
        if(err) console.error(err);
        res.redirect('/login');
    });
});

<<<<<<< HEAD
function checkLogged(req) {
    if (req.user) {
        return true;
    }
}

app.listen(PORT, () => { console.log(`Server is listening on ${PORT}`) });
=======
function isAuth(req, res, next) {
    if (!session.user) {
        return res.redirect('/login');
    } else {
        next();
    }
}

app.listen(3000, () => { console.log(`Server is listening on 3000`) });
>>>>>>> 333eae3f3e2c874fa2ff75db9e8759e7db44df99
