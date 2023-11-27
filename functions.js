const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const path = require('path')

let db = new sqlite3.Database('./serverdb.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to database');
    }
})

async function auth(email, pass) { //compare with before project
    let query = 'SELECT * FROM users WHERE email = ? LIMIT 1';
    let user = await getRecord(query, [email]);
    if (!user) {
        return { user: null, message: 'No user with that email' };
    }
    if (await comparePass(pass, user.password)) {
        return { user: { username: user.username, id: user.id }, message: null };
    } else {
        return { user: null, message: 'Wrong password!' };
    }
}

function getRecord(query, data) { //Change to async/await
    return new Promise((resolve, reject) => {
        db.get(query, data, (err, record) => {
            if (err) {
                reject(err);
            } else {
                resolve(record);
            }
        })
    })
}

async function dbRun(query, data) {
    db.run(query, data, (err) => {
        if (err) { console.error(err.message) };
    })
}

function getProfPic(user_id) {
    return new Promise((resolve, reject) => {
        db.get('SELECT pic_reference FROM profPics WHERE user_id = ?', [user_id], (err, record) => {
            if (err) {
                reject(err);
            } else {
                try {
                    resolve(record.pic_reference)
                } catch (err) {
                    resolve('common.png')
                }
            }
        })
    })
}

async function comparePass(input, password) {
    return await bcrypt.compare(input, password);
}

module.exports = { auth, getProfPic };