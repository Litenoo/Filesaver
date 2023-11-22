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

const router1 = require('./routes.js');
const { auth, dbRun, getRecord, getProfPic } = require('./functions');

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



let db = new sqlite3.Database('./serverdb.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err) } else {
        let query = 'CREATE TABLE IF NOT EXISTS users(id INT PRIMARY KEY NOT NULL,username VARCHAR(255) NOT NULL,password VARCHAR(255) NOT NULL,email VARCHAR(255) NOT NULL)';
        db.run(query);
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

app.delete('/logout', (req, res) => {
    req.session.destroy((err)=>{
        session.user = null
        if(err) console.error(err);
        res.redirect('/login');
    });
});

function isAuth(req, res, next) {
    if (!session.user) {
        return res.redirect('/login');
    } else {
        next();
    }
}

app.listen(3000, () => { console.log(`Server is listening on 3000`) });
