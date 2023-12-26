const express = require('express')
const app = express ();
const mainRoute = require('./router/routes')
const bodyParser = require('body-parser');
const session = require('express-session');

// express-session middleware
app.use(session({
    secret: 'pratham', 
    resave: false,
    saveUninitialized: true
  }));

app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/',mainRoute)

app.listen(8080,()=>{
    console.log("App is listeining")
})