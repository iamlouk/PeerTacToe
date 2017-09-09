const path = require('path');
const levelup = require('levelup');
const session = require('express-session');
const LevelStore = require('express-session-level')(session);

const config = require('../config');

const sessiondb = levelup(path.resolve(__dirname, '..', 'dbs/sessiondb'));

const levelStore = new LevelStore(sessiondb);

const sessionMiddleware = session({
    store: levelStore,
    secret: config.secret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: config.ssl ? true : false, httpOnly: true, maxAge: 30 * 60 * 1000 }
});

module.exports = sessionMiddleware;
