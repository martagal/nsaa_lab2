const path = require('path')
const express = require('express')
const logger = require('morgan')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const jwt = require('jsonwebtoken')

const jwtSecret = require('crypto').randomBytes(32) //32 random bytes secret everytime we bring up the server
console.log(`Token secret: ${jwtSecret.toString('base64')}`)

const cookieParser = require('cookie-parser')

const port = 3000 //standard for development

const app = express()
app.use(logger('dev'))

passport.use('local', new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password', 
        session: false
    },
    function (username, password, done){
        if(username === 'walrus' && password === 'walrus') {
            const user = {
                username : 'walrus', 
                description: 'you can visit the fortune teller'
            }
            done(null, user) //first arg: error (null)
        }
        else {
            done(null, false)
        }
    }
))

app.use(express.urlencoded({extended: true})) //needed to retrieve html forms
app.use(passport.initialize()) // we load the passport auth middleware to our express application. It should be loaded before any route.


//middlewares before routes
//routes are the last middleware
const myLogger = (req, res, next) => {
    next() 
}

app.use(myLogger)

app.use(function(err, req, res, next) {
    console.log(err.stack)
    res.status(500).send('there was an error')
})

app.get('/', (req, res) => {
    res.send('hello world')
})

app.get('/user', (req, res) => {
    const user = {
        username: "walrus",
        description: "it is what it is"
    }
    res.json(user)
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'))
})

app.post('/login', 
 passport.authenticate('local', {session:false, failureRedirect:'/login'}),  //call authenticate middleware before function handler
 (req, res) => {
    const payload = {
        //token can be checked at https://jwt.io/
        iss: 'localhost:3000', //issuer
        sub: req.user.username, //subject
        aud: 'localhost:3000', //audience
        exp: Math.floor(Date.now()/1000) + 604800 //1 week before expiration
    }
    const token = jwt.sign(payload, jwtSecret)
    console.log(token)
    //res.send(token)
    res.cookie('cookie_token', token).redirect('/')
})



app.listen(port, function() {
 console.log(`Listening at http://localhost:${port}`) //con las quotes estas al reves se pueden usar variables inside con ${}
})