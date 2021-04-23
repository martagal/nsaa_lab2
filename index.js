const path = require('path')
const express = require('express')
const logger = require('morgan')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const GitHubStrategy = require('passport-github2').Strategy
const jwt = require('jsonwebtoken')
const db = require('./psw.json')
const bcrypt = require('bcryptjs')

const jwtSecret = require('crypto').randomBytes(32) //32 random bytes secret everytime we bring up the server
console.log(`Token secret: ${jwtSecret.toString('base64')}`)

const  GITHUB_CLIENT_ID = "9f3160e536e354319109"
const GITHUB_CLIENT_SECRET = "c08e3b3081334817c9db52f804cce10ab4309686"

const cookieParser = require('cookie-parser')

const fortune = require('fortune-teller')

const port = 3000 //standard for development

var payload = null

const app = express()
app.use(logger('dev'))

passport.use('local', new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password', 
        session: false
    },
    function (username, password, done){
        const psw = db[username]
        if (psw && bcrypt.compareSync(password, psw)){
            const user = {
                username : username, 
                description: 'you can visit the fortune teller'
            }
            done(null, user) //first arg: error (null)
        }
        else {
            console.log('Wrong login')
            done(null, false)
        }
    }
))

passport.use('github', new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    //console.log(profile)
    done(null, profile)
  }
));

app.use(express.urlencoded({extended: true})) //needed to retrieve html forms
app.use(passport.initialize()) // we load the passport auth middleware to our express application. It should be loaded before any route.


//middlewares before routes
//routes are the last middleware
const myLogger = (req, res, next) => {
    next() 
}

app.use(myLogger)

app.use(cookieParser())

app.use(function(err, req, res, next) {
    console.log(err.stack)
    res.status(500).send('there was an error')
})

var cookieExtractor = function(req) {
    var token = null;
    if (req && req.cookies)
    {
        token = req.cookies['cookie_token'];
    }
    return token;
};

passport.use('jwt', new JwtStrategy(
    {
        jwtFromRequest : cookieExtractor, 
        secretOrKey: jwtSecret
    },
    function (token, done){
        done(null, token)
    }    
))


app.get('/', passport.authenticate('jwt', {session: false,  failureRedirect:'/login'} ), 
(req, res) => {
    var adage = fortune.fortune()
    res.send(`WELCOME TO THE FORTUNE TELLER: <p> ${adage} <p> <p><a href ='/logout'>Logout</a></p>`)
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

app.get('/logout', (req, res) => {
    res.sendFile(path.join(__dirname, 'logout.html'))
})

app.post('/login', 
 passport.authenticate('local', {session:false, failureRedirect:'/login'}),  //call authenticate middleware before function handler
 (req, res) => {
    payload = {
        //token can be checked at https://jwt.io/
        iss: 'localhost:3000', //issuer
        sub: req.user.username, //subject
        aud: 'localhost:3000', //audience
        exp: Math.floor(Date.now()/1000) + 604800, //1 week before expiration
        exam: {
            name: 'marta', 
            surname: 'galindo'
        }
    }
    const token = jwt.sign(payload, jwtSecret)
    //console.log(token)
    //res.send(token)
    res.cookie('cookie_token', token).redirect('/')
})

app.get('/auth/github',
  passport.authenticate('github', {session:false, scope: [ 'profile' ] }));

app.get('/auth/github/callback', 
  passport.authenticate('github',  {session:false,  failureRedirect:'/login'}),
  function(req, res) {
    // Successful authentication, redirect home.
    //console.log('HEMOS ENTRADO A GITHUB')
    payload = {
        //token can be checked at https://jwt.io/
        iss: 'localhost:3000', //issuer
        sub: req.user.username, //subject
        aud: 'localhost:3000', //audience
        exp: Math.floor(Date.now()/1000) + 604800, //1 week before expiration
        exam: {
            name: 'marta', 
            surname: 'galindo'
        }
    }
    const token = jwt.sign(payload, jwtSecret)
    res.cookie('cookie_token', token).redirect('/')
    }
);


app.post('/logout', (req, res) => {
    res.clearCookie('cookie_token').redirect('login')
})


app.listen(port, function() {
 console.log(`Listening at http://localhost:${port}`) //con las quotes estas al reves se pueden usar variables inside con ${}
})