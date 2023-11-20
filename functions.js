const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');

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
    if(!user){
        return {user:null, message: 'No user with that email'}
    }
    if(await comparePass(pass, user.password)){
        return {user:user, message:null}
    }else{
        return {user: null, message:'Wrong password!'}
    }
}

function getRecord(query,data){
    return new Promise((resolve,reject)=>{
        db.get(query, data, (err, record)=>{
            if(err){
                reject(err);
            }else{
                resolve(record);
            }
        })
    }
)}

async function comparePass(input, password) {
    console.log(input, password);
    return await bcrypt.compare(input, password);
}

module.exports = { auth };