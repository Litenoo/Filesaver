const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');

let db = new sqlite3.Database('./serverdb.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to database');
    }
})

async function auth(email, pass) { 
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

async function register(pass, email, username) {// Delete duplicates
    let hashedPass = await bcrypt.hash(pass, 10);

    let validateEmail = await getRecord('SELECT email FROM users where email = ?', [email])
    let validateUsername = await getRecord('SELECT username FROM users WHERE username = ?',[username])

    if (validateEmail) {
            return { err: 'There is already user with that email' };
    }

    if (validateUsername) {
        if(validateUsername.username === username){
            return { err: 'There is already user with that username' };
        }
    }

    db.run('INSERT INTO users (username, password, email) VALUES (?,?,?)', [username, hashedPass, email], (err) => {
        if (err) {
            return null;
        }
    });

    let userId = await getRecord('SELECT id FROM users WHERE email = ?', [email])

    db.run('INSERT INTO profPics (user_id, pic_reference) VALUES (?,?)', [userId.id, 'common.png'], (err) => {
        if (err) { return null; }
    });
}

function getRecord(query, data) {
    return new Promise((resolve, reject) => {
        try{
            db.get(query, data, (err, record) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(record);
                }
            });
        }catch(err){
            reject(err);
        }
    });
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

function deleteAcc(email) {
    let query = 'DELETE FROM users WHERE email = ?';
    db.run(query, [email], (err) => {
        if (err) { console.error(err) };
    })
}

async function comparePass(input, password) {
    return await bcrypt.compare(input, password);
}

module.exports = { auth, getProfPic, register, getRecord, deleteAcc };