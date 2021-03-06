const express    = require('express')
const session    = require('express-session')
const app        = express()
const cors       = require('cors')
const routes     = require('./server/routes')
const oauth      = require('./server/oauth')
const bodyParser = require('body-parser')
const http       = require('http').Server(app)
const io         = require('socket.io')(http)
require('dotenv').config()
const port       = 3001

app
    .set('view engine', 'ejs')
    .set('socketio', io)
    .set('views', 'views')
    .use(session({
        secret: "Linernotes",
        cookie: {secure: false},
        resave: false,
        saveUninitialized: true
    })) 
    .use(cors())
    .use(express.static("static"))
    .use(bodyParser.urlencoded({ extended: false }))
    .use(bodyParser.json())
    .use(oauth)
    .use(routes)
    
http.listen(port,()=>console.log(`Listening on port ${port}`))
