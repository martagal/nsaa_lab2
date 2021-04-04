# NSAA Lab2: Express + Passport

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


