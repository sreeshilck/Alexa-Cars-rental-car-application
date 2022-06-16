var express = require('express');
const async = require('hbs/lib/async');
var userRouter = express();
const User_Register = require("../models/userModels")
const bcrypt = require("bcrypt")
const bodyParser = require('body-parser')
const userController = require('../controller/userController')
const Auth = require('../middleware/userAuth')
const carModel = require('../models/carModels');


userRouter.set('view engine', 'hbs');
userRouter.set('views', './views');

userRouter.use(bodyParser.json());
userRouter.use(bodyParser.urlencoded({ extended: true }));


// GET landing page.
userRouter.get('/', userController.homePageLoad);


/*=========== User Login And SignUp Start ===========*/

//GET user signup page
userRouter.get('/user/user-signup', userController.getSignupPage);

userRouter.post('/user/user-signup', userController.insertUser);

// user login page
userRouter.post('/user/user-login', userController.loginUser);

// GET otp page
userRouter.get('/user/user-verify', userController.getOtpPage);

//otp verification
userRouter.post('/user/verifyotp', userController.VerifyOTP);

//resend otp verification
userRouter.get('/user/resendotp', userController.resendOtp);

/*=================== User Login And SignUp End ==================*/


/*============= User Password Reset Start ==============*/

// GET reset  password email page
userRouter.get('/user/reset', userController.getUserResetPage);

//reset password email id from userresetpage
userRouter.post('/user/reset-pass', userController.resetUserPassword);

// GET reset password page
userRouter.get('/user/reset-password', userController.getResetPage);

//update the user password with new one
userRouter.post('/user/reset-password', userController.updateNewPassword);

/*============= User Password Reset End ==============*/

//GET user order history 
userRouter.get('/user/order-history', Auth.userAuth, userController.getOrderHistory)

//GET user order history 
userRouter.get('/user/booking-order-history', Auth.userAuth, userController.getBookingngOrderHistory)

//GET user user profile
userRouter.get('/user/user-profile', Auth.userAuth, userController.getUserProfile)

//edit user profile
userRouter.post('/user/edit-profile', userController.editUserProfile)



//GET user change password
userRouter.get('/user/changepassword', Auth.userAuth, userController.getUserChangePassword)
// user change password
userRouter.post('/user/editpassword',  userController.changeUserPassword)

//GET user id details
userRouter.get('/user/iddetails', Auth.userAuth, userController.getUserIddetails)


//POST guest search results
userRouter.post('/user/rentacar-now', userController.getSearchResults);


// GET user home page
userRouter.get('/user/user-home', userController.getUserhomePage);
// post search

userRouter.post('/user/search', userController.getSearchDetails);
//GET booking summary
userRouter.get('/user/booking-summary', Auth.userAuth, userController.getBookingSummaryPage);

//verify coupon code
userRouter.post('/user/coupon-verify', userController.verifyCoupon);



//get checkout
userRouter.get('/user/checkout', Auth.userAuth, userController.getCheckOutPage);
//post user ID 
userRouter.post('/user/checkout', userController.userIdSubmit);


//GET booking cancel
 userRouter.get('/user/cancel-booking', userController.cancelBooking);















//userRouter.post('/user/verify-payment', userController.verifyPayment);



// booked locations
userRouter.post('/user/location',async (req,res)=>{
    
    if(req.body.pickuplocation == "" && req.body.dropofflocation == ""){
        
        let status = false
        res.send(status)
    }else{

        var numbers = /^[0-9]+$/;
      if(req.body.pickuplocation.match(numbers) || req.body.dropofflocation.match(numbers)){
        let status = false
        res.send(status)
      }else{
        req.session.locationData = req.body
        let status = true
        res.send(status)
      }

   
    }
    
})


//GET booking 
userRouter.post('/user/bookcar', userController.getBooking);


userRouter.post('/user/verify-payment',(req,res)=>{
   
    userController.verifyPayment(req.body).then(()=>{
   
          userController.changePaymentStatus(req.body.order.receipt,req.body).then(()=>{

            console.log("payment Sucessful");
            res.json({status:true})
          }).catch((err) =>{
              console.log(err.message,"second then error");

          })
    }).catch((err)=>{
      
      res.json({status:false,errMsg:''})
     })
  })



//get order success page
userRouter.get('/user/order-success', Auth.userAuth, userController.getOrderSuccessPage);


















userRouter.get('/user/about', userController.getAboutPage);


userRouter.get('/user/contactus', userController.getContactUsPage);



// GET user logout
userRouter.get('/user/user-logout', userController.getUserLogout);


// filter post
userRouter.post('/user/filter-search/:id',userController.filterSubmit)


module.exports = userRouter;