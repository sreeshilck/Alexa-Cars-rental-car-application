const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require('express-handlebars');
const session = require('express-session');
require('dotenv').config({debug:true});

const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

//=====db connection and models
const config = require("./config/config")
const Register = require('./models/userModels')
const Admin_Register = require('./models/adminModels')
const Booking_Register = require("./models/bookingModels")

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//layout setting
app.engine('hbs',hbs.engine({    
  extname:'hbs',
  defaultLayout:'layout',
  LayoutsDir:__dirname+'/views/layouts/',
  partialsDir:__dirname+'/views/partials/'
 }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// session and cookie
app.use(session({secret:process.env.SECRET_KEY_SESSION, cookie:{maxAge:60000000}}))

app.use((req,res,next)=>{
  res.set('Cache-Control','no-store')
  next()
})

app.use('/', userRouter);
app.use('/admin', adminRouter);



app.get("*",(req,res) => {
   res.render("user/404page",{layout:false})

})
// catch 404 and forward to error handler
// app.use(function(req, res, next) {
  
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
