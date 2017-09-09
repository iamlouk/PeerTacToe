const path = require('path');
const crypto = require('crypto');
const levelup = require('levelup');
const querystring = require('querystring');
const utils = require('./utils.js');
const log = utils.log('auth');

const PROJECT_HOME = path.resolve(__dirname, '..');
const db = levelup(PROJECT_HOME + '/dbs/userdb', {
    createIfMissing: true,
    keyEncoding: 'utf8',
    valueEncoding: 'json'
});

const getUserdata = (username) => new Promise((resolve, reject) => {
    db.get('user:' + username, (err, data) => {
        if (err) reject(err);
        else resolve(data);
    });
});

const putUserdata = (username, data) => new Promise((resolve, reject) => {
    db.put('user:' + username, data, (err) => {
        if (err) reject(err);
        else resolve();
    });
});

const hashPassword = (password, salt) => new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 1000, 66, 'sha512', (err, hashed) => {
        if (err) reject(err);
        else resolve(hashed.toString('base64'));
    });
});

const isValidUsername = (username) => (typeof username == 'string') && username.length > 2 && username.length < 20 && (/[a-z0-9_-]/i).test(username);
const isValidPassword = (password) => (typeof password == 'string') && password.length > 6 && password.length < 128;

let login = async (username, password) => {
    if (!isValidUsername(username) || !isValidPassword(password))
        throw new Error('invalid credentials');

    let userdata = await getUserdata(username);
    let hashed = await hashPassword(password, userdata.salt);

    if (userdata.password !== hashed)
        throw new Error('invalid credentials');

    return userdata;
};

let register = async (username, password) => {
    if (!isValidUsername(username) || !isValidPassword(password))
        throw new Error('invalid credentials');

    let userExists = true;
    try {
        await getUserdata(username);
    } catch (err) {
        if (err.notFound)
            userExists = false;
        else
            throw err;
    }
    if (userExists)
        throw new Error('username taken');

    let salt = crypto.randomBytes(33).toString('base64');
    let hashed = await hashPassword(password, salt);
    let userdata = {
        password: hashed,
        salt: salt,
        username: username,
        id: username
    };

    await putUserdata(username, userdata);

    return userdata;
};

exports.login = (req, res) => {
    let { username, password } = req.body;
    login(username, password).then((userdata) => {
        req.session.valid = true;
        req.session.username = userdata.username;
        req.session.userId = userdata.id;

        log.verb('login succesfull: ' + username);
        req.session.save((err) => res.redirect('/'));
    }, (err) => {
        log.warn('login err:' + err.message);
        res.redirect('/login?err=' + err.name + '&message=' + querystring.escape(err.message));
    });
};

exports.register = (req, res) => {
    let { username, password } = req.body;
    register(username, password).then((userdata) => {
        req.session.valid = true;
        req.session.username = userdata.username;
        req.session.userId = userdata.id;

        log.verb('register succesfull: ' + username);
        req.session.save((err) => res.redirect('/'));
    }, (err) => {
        log.warn('register err:' + err.message);
        res.redirect('/login?err=' + err.name + '&message=' + querystring.escape(err.message));
    });
};
