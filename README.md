# NSAA Lab2: Express + Passport

Do-it-yourself exercises after completing the tutorial.
## 6.1. Exchange the JWT using cookies

Instead of sending the JWT directly to the browser, it is written to a cookie and redirected to ```/``` with:

```
res.cookie('cookie_token', token).redirect('/')
```
(line 121 in _index.js_)

The browser then presents this cookie every time it connects to the server with the help of the cookie-parser middleware, which parses the cookie data. With the passport called 'jwt', defined in line 75 of _index-js_: 


```
passport.authenticate('jwt', {session: false,  failureRedirect:'/login'} )
```


