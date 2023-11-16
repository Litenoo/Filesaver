require('dotenv').config();

const express = require("express");
const PORT = 3000;
const app = express();
const bcrypt = require('bcrypt');
const passport = require('passport');
const sqlite3 = require('sqlite3').verbose();
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('express-flash');
const initAuth = require('./auth.js');

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

app.set({ 'view-engine': 'ejs' });
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
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
    }
})

app.get('/register', (req, res) => {
    if (req.user) {
        res.redirect('/');
    } else {
        res.render('register.ejs');
    }
})

app.get('/login', (req, res) => {
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

app.delete('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
})

function checkLogged(req) {
    if (req.user) {
        return true;
    }
}

app.listen(PORT, () => { console.log(`Server is listening on ${PORT}`) });