# NSAA Lab2: Express + Passport

(Lab3 at the end of README.MD) 

Do-it-yourself exercises after completing the tutorial.
## 6.1. Exchange the JWT using cookies

Instead of sending the JWT directly to the browser, it is written to a cookie and redirected to ```/``` with:

```
res.cookie('cookie_token', token).redirect('/')
```
(line 121 in _index.js_)

The browser then presents this cookie every time it connects to the server with the help of the ```cookie-parser``` middleware, which parses the cookie header on the request and exposes the cooke:

. With the passport called 'jwt', defined in line 75 of _index-js_: 


```
passport.authenticate('jwt', {session: false,  failureRedirect:'/login'} )
```

## 6.2. Create the fortune-teller endpoint

With the ```fortune-teller``` package, the route ```/``` is transformed to a fortune teller that generates random adages: 

```
var adage = fortune.fortune()
```
(line 88 of _index.js_)

Before generating and displaying the random adage, the passport JWT strategy is used to verify a JWT in a cookie: 

```
passport.use('jwt', new JwtStrategy(
    {
        jwtFromRequest : cookieExtractor, 
        secretOrKey: jwtSecret
    },
    function (token, done){
        done(null, token)
    }    
))
```

```cookieExtractor``` is defined in line 66 of _index.js _ and it returns the value of the cookie.

If the user is not authenticated, it is redirected to the login page (line 86 of _index.js_).


## 6.3. Add a logout endpoint

In the route ```/```, a link to the  ```/logout``` route is displayed. In the page _logout.html_ the user can click to logout and the cookie is reseted: 
```
res.clearCookie('cookie_token').redirect('login')
```


## 6.4. Add bcrypt or scrypt to the login process

The file _psw.json_ contains a JSON of two users (_walrus_ and _walrus2_) and their correspondent Bcrypt hash of the passwords (_walrus_ and _walrus2_), generated online. 

Using the package ```bcryptjs```, in the Passport local Strategy (from line 25 to 45 of _index.js_), the login data is verified against the file _psw.json_. 

```
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
```

If the login is correct, the user's cookie is created. Otherwise, it is redirected to the login page again. 

```
passport.authenticate('local', {session:false, failureRedirect:'/login'})
```
(line 108 of _index.js_)

# NSAA Lab3: OAuth

Added Login functionality: now the user can log in using his or her GitHub account. For that, a new button (Login with GitHub) is added in the _login.html_ page.  The passport strategy ```passport-github2``` is used for authenticating with GitHub using the OAuth 2.0 API.

A new strategy is defined:

```
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
```

_GITHUB_CLIENT_ID_ and _GITHUB_CLIENT_SECRET_ are defined at the top of the code, with the values got from registering the OAuth app in GitHub. 

To authenticate requests: 


```
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

```