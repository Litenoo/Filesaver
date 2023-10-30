const dotenv = require('dotenv');

const PORT = 3000;
const express = require("express");
const app = express();

const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const users = [];

app.set({ 'view-engine': 'ejs' })
app.use(express.urlencoded({ extended: false }))

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.render('index.ejs');
})

app.get('/register', (req, res) => {
    res.render('register.ejs');
})

app.get('/login', (req, res) => {
    res.render('login.ejs');
})

app.post('/register', async (req, res) => {
    const hashedPass = await bcrypt.hash(req.body.password, 10)
    users.push({
        username: req.body.username,
        email: req.body.email,
        password: hashedPass,
    })
    console.log(users[users.length -1]);
    res.redirect('/login');
})

app.listen(PORT, () => { console.log(`Server is listening ${PORT}`) });



/*Todos:
-- Login/Register System + Logout system
-- File saving for each user
-- Database to save files -- Optional but it would be cool if
*/