//    Copyright 2016 underdolphin(masato sueda)
// 
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
// 
//        http://www.apache.org/licenses/LICENSE-2.0
// 
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.

import * as http from 'http';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as methodOverride from 'method-override';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as socketio from 'socket.io';
const sqliteStore = require('connect-sqlite3')(session);
const app = express();
const server = http.createServer(app);

/**
 * session setup
 */
const sessionMiddleware = session({
    secret: 'example secret',
    cookie: { maxAge: 2 * 60 * 60, httpOnly: false },
    saveUninitialized: true,
    resave: false,
    store: new sqliteStore({
        dir: `${__dirname}/db`,
        table: 'sessions',
        db: 'sessions.sqlite3'
    })
});

/**
 * express setup
 */
app.use('/', express.static(`${__dirname}/view`));
app.set('views', `${__dirname}/view`);
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(cookieParser());
app.use(sessionMiddleware);

/**
 * socket.io setup
 */
const io = socketio(server);
io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
});

io.on('connection', (socket) => {
    console.log('a user conncted');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

app.get('/', (req, res) => {
    console.log(req.session);
    res.render('index', { session: JSON.stringify(req.session) });
});

server.listen(3000, () => {
    console.log('listen in 3000');
});