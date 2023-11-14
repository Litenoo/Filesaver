const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

function initAuth(passport, getUserByEmail, getUserById) {
    async function authUser(email, password, done) {
        const user = await getUserByEmail(email);

        if (user == null) {
            return done(null, false, { message: 'No user with that email' });
        }

        try {
            if (await comparePass(password, user)) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Wrong password' });
            }
        } catch (err) {
            return done(err);
        }

    }

    passport.use(new LocalStrategy({ usernameField: 'email' }, authUser));

    passport.serializeUser((user, done) => {
        console.log('serialize');
        return done(null, user.id);
    })

    passport.deserializeUser((id, done) => {
        console.log('deserialize');
        return done(null, getUserById(id));
    })
}

async function comparePass(password, user) {
    return await bcrypt.compare(password, user.password);
}

module.exports = initAuth;