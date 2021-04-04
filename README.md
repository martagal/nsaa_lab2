# NSAA Lab2: Express + Passport

Do-it-yourself exercises after completing the tutorial.
## 6.1. Exchange the JWT using cookies

In _index-js_, instead of sending the JWT directly to the browser, it is written to a cookie that the browser then presents every time it connects to the server  

```
res.cookie('cookie_token', token).redirect('/')
```

