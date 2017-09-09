const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const utils = require('./utils.js');
const config = require('../config');

const PUB = path.resolve(__dirname, '..', 'client/pub');
const log = utils.log('index');
utils.setLoglevel(0);



const app = express();
const server = config.ssl ? require('https').createServer({
    key:  fs.readFileSync(config.ssl['key']),
    cert: fs.readFileSync(config.ssl['cert']),
    ca:   fs.readFileSync(config.ssl['ca'])
}, app) : require('http').createServer(app);

const io = require('socket.io')(server);
const sockets = require('./sockets.js').init(io);

const urlencodedParser = bodyParser.urlencoded({ extended: true });
const sessionMiddleware = require('./session.js');




app.use(express.static(PUB, { index: false }));

app.get('/favicon.ico', (req, res) => res.sendFile(PUB + '/favicon.png'));

app.get('/', sessionMiddleware, (req, res) => {
    if (req.session.valid) {
        res.sendFile(PUB + '/index.html');
    } else {
        res.status(401).redirect('/login?code=401');
    }
});

const auth = require('./auth.js');

app.get('/login', (req, res) => res.sendFile(PUB + '/login.html'));

app.post('/login', urlencodedParser, sessionMiddleware, auth.login);

app.post('/register', urlencodedParser, sessionMiddleware, auth.register);

app.get('/logout', sessionMiddleware, (req, res) => {
    let user = sockets.connected[req.session.userId];
    if (user)
        user.disconnect();

    req.session.destroy(() => res.redirect('/login'));
});

app.use((req, res) => res.status(404).sendFile(PUB + '/404.html'));




server.listen(config.port || process.env.PORT, () => log.info('Server running: port='+server.address().port));

// app.get('/teapot', (req, res) => res.status(418).send('I\'m a teapot'));
// app.get('/test', sessionMiddleware, (req, res) => {
//     console.log(req.session.id);
//     console.log(req.headers);
//
//     req.session.count = req.session.count ? req.session.count + 1 : 1;
//
//     res.setHeader('Content-Type', 'text/plain');
//     res.write(`id: ${ req.session.id }\n`);
//     res.write(`session: ${ JSON.stringify(req.session) }\n`);
//     res.write(`counter: ${ req.session.count }\n`);
//     res.end();
// });
