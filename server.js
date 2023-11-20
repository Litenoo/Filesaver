require('dotenv').config();

const express = require("express");
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('express-flash');
const app = express();

app.set({ 'view-engine': 'ejs' });
app.use(methodOverride('_method'));
app.use(flash());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}))

const {auth} = require('./functions');


let db = new sqlite3.Database('./serverdb.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) { console.error(err) } else {
        let query = 'CREATE TABLE IF NOT EXISTS users(id INT PRIMARY KEY NOT NULL,username VARCHAR(255) NOT NULL,password VARCHAR(255) NOT NULL,email VARCHAR(255) NOT NULL)';
        db.run(query);
    }
})

app.get('/', (req, res) => {
    if (session.user) {
        res.render('index.ejs', { name: session.user.username});
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
    let error = req.flash().error;
    res.render('login.ejs', {error});
})

app.post('/register', async (req, res) => {
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    let query = `INSERT INTO users (username, email, password) VALUES (?,?,?)`;
    db.run(query, [req.body.username, req.body.email, hashedPass], (err)=>{
        if(err){
            res.redirect('/register');
        }else{
            res.redirect('/login');
        }
    });
});

app.post('/login', async (req,res)=>{
    let response =  await auth(req.body.email, req.body.password);
    if(response.user){
        session.user = response.user;
        console.log('user is logged in !')
        res.redirect('/')
    }else{

    }
})

app.delete('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
})

app.listen(3000, () => { console.log(`Server is listening on 3000`) });