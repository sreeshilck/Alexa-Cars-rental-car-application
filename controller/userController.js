const nodemailer = require('nodemailer');
const userModel = require('../models/userModels');
const carModel = require('../models/carModels');
const bookingModel = require('../models/bookingModels');
const couponModel = require('../models/couponModels');
const bcrypt = require('bcrypt');
const async = require('hbs/lib/async');
const bodyParser = require("body-parser")
const dotenv = require("dotenv").config({ debug: true })
const randomString = require("randomstring")
const Razorpay = require("razorpay");
const { response } = require('../routes/user');
const { resolve } = require('node:path');
const moment = require('moment');




const instance = new Razorpay({
    key_id: process.env.RazorPayKeyId,
    key_secret: process.env.RazorPaySecretKey,
});





//get landing page
const homePageLoad = async (req, res) => {

    try {
        if (req.session.userLoggedIn) {
            res.redirect("/user/user-home")
        } else {
            res.render('user/index', { logginError: req.session.logginError, resetSuccessMsg: req.session.resetSuccessMsg });
            req.session.logginError = false
            req.session.resetSuccessMsg = false
        }

    } catch (error) {
        console.log(error);
    }
}
// get signup page
const getSignupPage = async (req, res) => {
    try {
        if (req.session.user) {
            res.redirect("/user/user-home")
        } else {
            res.render('user/user-signup', { layout: false, userExist: req.session.userExist })
            req.session.userExist = false
        }

    } catch (error) {
        console.log(error);
    }
}



//=========================== OTP Verification start ====================================
//  create user start
const insertUser = async (req, res) => {

    try {
        let useremail = req.body.email

        let ifExist = await userModel.find({ email: useremail })

        if (ifExist != "") {
            req.session.userExist = "Email already exists"
            res.redirect("/user/user-signup")
        } else {




            const spassword = await securePassword(req.body.password);
            const user = ({
                name: req.body.name,
                email: req.body.email,
                password: spassword,
                phonenumber: req.body.phonenumber
            });

            req.session.userDetials = user

            const otpGenerator = await Math.floor(1000 + Math.random() * 9000);

            req.session.OTP = otpGenerator;

            if (user) {
                sendVerifyMail(req.body.name, req.body.email, otpGenerator)
                let StartTime = new Date()
                req.session.otpsentTime = moment(StartTime, 'YYYY-M-DD HH:mm:ss')


                res.redirect('/user/user-verify');

            } else {
                res.redirect('/user/user-signup');

            }


        }


    } catch (error) {
        console.log(error.message);
    }

}

// create user end


// password hash
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

// send otp mail start
const sendVerifyMail = async (name, email, otpGenerator) => {

    try {
        const mailTransporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            service: "gmail",
            port: 465,
            secure: true,
            auth: {
                user: process.env.AUTH_EMAIL,
                pass: process.env.AUTH_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }

        });

        const mailDetails = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Email Verification",
            text: "just random texts ",
            html: '<p>Hi <b>' + name + '</b> Your OTP to register <b>Alexa Cars</b> is <b><u>' + otpGenerator + '</u></b>. The OTP is valid only for 3 minutes.'
        }
        mailTransporter.sendMail(mailDetails, (err, Info) => {
            if (err) {
                console.log(err);
            } else {
                console.log("email has been sent ", Info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }

}

// send otp mail end


// get otp page
const getOtpPage = async (req, res) => {

    try {
        if (req.session.user) {
            res.redirect("/user/user-home")
        } else {
            res.render('user/otp', { layout: false, OtpErr: req.session.ErrOtp });
            req.session.ErrOtp = false
        }
    } catch (error) {
        console.log(error);
    }
}

// verify otp
const VerifyOTP = async (req, res) => {

    let userOTP = req.body.otp

    console.log(req.session.OTP);
    let userDetials = req.session.userDetials

    let otpCheckTime = new Date()
    let endTime = moment(otpCheckTime, 'YYYY-M-DD HH:mm:ss')

    var secondsDiff = endTime.diff(req.session.otpsentTime, 'seconds')
    try {
        if (secondsDiff <= 180) {



            if (req.session.OTP == userOTP) {
                const user = new userModel({
                    name: userDetials.name,
                    email: userDetials.email,
                    password: userDetials.password,
                    phonenumber: userDetials.phonenumber
                });
                const userData = await user.save();
                req.session.userLoggedIn = true
                req.session.user = userData
                req.session.userDetials = null
                req.session.OTP = null
                res.redirect("/user/user-home")
            } else {
                req.session.ErrOtp = "Invalid OTP !!!"
                res.redirect("/user/user-verify")
            }
        } else {
            req.session.ErrOtp = "OTP is Expired!!!"
            res.redirect("/user/user-verify")
        }

    } catch (error) {
        console.log(error);
    }
}

//resend otp
const resendOtp = async (req, res) => {

    try {

        if (req.session.userDetials) {
            const otpGenerator = await Math.floor(1000 + Math.random() * 9000);
            req.session.OTP = otpGenerator;
            sendVerifyMail(req.session.userDetials.name, req.session.userDetials.email, otpGenerator)
            req.session.otpsentTime = moment().format('LT');
            res.redirect('/user/user-verify');

        } else {
            res.redirect('/user/user-signup');

        }

    } catch (error) {
        console.log(error);
    }
}

//=========================== OTP Verification end  ====================================

// get user home page
const getUserhomePage = async (req, res) => {
    let userdateData = req.session.dateData
    console.log(userdateData);
    let userValue = req.session.user
    let allCarData = await carModel.find({ isAvailable: { $ne: "false" } }).lean()

    try {
        if (req.session.userLoggedIn) {
            res.render('user/user-home', { userValue, allCarData, userdateData, dateError: req.session.dateError });
            req.session.dateError = false;
        } else {
            res.redirect("/")
        }

    } catch (error) {
        console.log(error);
    }
}


// user login page
const loginUser = async (req, res) => {


    try {
        const email = req.body.email
        const password = req.body.password;

        const userLoginData = await userModel.findOne({ email: email });
        if (!userLoginData.isBlocked) {
            const isMatch = await bcrypt.compare(password, userLoginData.password)
            if (isMatch) {

                req.session.userLoggedIn = true
                req.session.user = userLoginData
                res.status(201).redirect("/user/user-home");

            } else {
                req.session.logginError = "Invalid Username or Password"
                res.redirect("/")

            }
        } else {
            req.session.logginError = "You are blocked by the admin"
            res.redirect("/")
        }


    } catch (error) {
        req.session.logginError = "Invalid Username or Password"
        res.redirect("/")
    }
}


//=============== User Password Reset Start =======================
// get forgot password
const getUserResetPage = async (req, res) => {

    try {

        res.render("user/forgot-password", { layout: false, mailMsg: req.session.checkMailMsg, Errmsg: req.session.checkMailErr })
        req.session.checkMailMsg = false
        req.session.checkMailErr = false
    } catch (error) {
        console.log(error);
    }
}
// reset password                                               
const resetUserPassword = async (req, res) => {

    try {

        const email = req.body.email;
        const userResetData = await userModel.findOne({ email: email });
        req.session.userResetid = userResetData._id;

        if (userResetData) {
            const validRandomString = randomString.generate();
            req.session.randomString = validRandomString;

            sendPasswordResetMail(userResetData.name, userResetData.email, validRandomString)

            req.session.checkMailMsg = "Check your Email to reset your password"
            res.redirect("/user/reset")


        } else {

            req.session.checkMailErr = "Invalid Email Id"
            res.redirect("/user/reset")
        }


    } catch (error) {
        console.log(error);
    }
}



// send reset password mail start
const sendPasswordResetMail = async (name, email, tocken) => {

    try {
        const mailTransporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            service: "gmail",
            port: 465,
            secure: true,
            auth: {
                user: process.env.AUTH_EMAIL,
                pass: process.env.AUTH_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }

        });

        const mailDetails = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Reset Password",
            text: "just random texts ",
            html: '<p>Hi ' + name + ' click <a href ="https://alexacars.ml/user/reset-password?tocken=' + tocken + '"> here to </a> to reset your password</p>'
        }
        mailTransporter.sendMail(mailDetails, (err, Info) => {
            if (err) {
                console.log(err);
            } else {
                console.log("email has been sent ", Info.response);
            }
        })
    } catch (error) {
        console.log(error.message);
    }

}

// send reset password mail end

// get reset password page
const getResetPage = async (req, res) => {

    try {

        const token = req.query.tocken;
        const validToken = req.session.randomString
        const userResetid = req.session.userResetid
        if (validToken && userResetid) {

            res.render("user/reset-passwordPage", { user_id: userResetid, layout: false });
        } else {
            res.render("user/404page", { message: "page not found", layout: false })
        }


    } catch (error) {
        console.log(error.message);
    }
}


// update the user password
const updateNewPassword = async (req, res) => {

    try {
        const newPassword = req.body.password
        const resetId = req.session.userResetid
        const newSecurePassword = await securePassword(newPassword);
        await userModel.findByIdAndUpdate({ _id: resetId }, { $set: { password: newSecurePassword } })
        req.session.randomString = null;
        req.session.userResetid = null;
        req.session.resetSuccessMsg = "Your password updated successfully.."
        res.redirect("/")


    } catch (error) {
        console.log(error.message);
    }
}
//=============== User Password Reset End  =======================

//get car booking summary

const getBookingSummaryPage = async (req, res) => {

    try {
        const User_id = req.session.user._id

        let selecteddateData = req.session.dateData
        
        if (selecteddateData) {


            if (selecteddateData.startdate && selecteddateData.enddate) {


                let selectedCarId = req.query.id
                let selectedCarPlan = req.query.plan

                userValue = req.session.user
                req.session.selecteddateData = selecteddateData

                let bookCarData = await carModel.findById(selectedCarId).lean()
                let bookedUser = await userModel.findById(User_id).lean()


                if (selectedCarPlan == bookCarData.fareplan[0].plan1.plan) {

                    req.session.plan = bookCarData.fareplan[0].plan1;
                    var selectedCarFare = bookCarData.fareplan[0].plan1.fare
                    var selectedCarKms = bookCarData.fareplan[0].plan1.kms

                } else if (selectedCarPlan == bookCarData.fareplan[0].plan2.plan) {

                    req.session.plan = bookCarData.fareplan[0].plan2;
                    var selectedCarFare = bookCarData.fareplan[0].plan2.fare
                    var selectedCarKms = bookCarData.fareplan[0].plan2.kms

                } else if (selectedCarPlan == bookCarData.fareplan[0].plan3.plan) {

                    req.session.plan = bookCarData.fareplan[0].plan3;
                    var selectedCarFare = bookCarData.fareplan[0].plan3.fare
                    var selectedCarKms = bookCarData.fareplan[0].plan3.kms

                } else {
                    console.log("invalid plans selected");
                }


                const dateIn = new Date(selecteddateData.startdate);
                const dateout = new Date(selecteddateData.enddate);
                const time = Math.abs(dateout - dateIn);
                const totalhours = Math.ceil(time / (1000 * 60 * 60));
                const days = Math.ceil(totalhours / 24)

                let totalfare = days * selectedCarFare + bookCarData.deposit
                req.session.totalfare = totalfare

                const selectedCarData = await carModel.findById(selectedCarId).lean()


               
                let startdate = moment(selecteddateData.startdate).format('llll');
                let enddate = moment(selecteddateData.enddate).format('llll');


                let dob = moment(bookedUser.dateofbirth).format('L');
                bookedUser = {
                    dob: dob
                }
                res.render("user/booking-summary", {
                    selectedCarData, selectedCarFare, selectedCarKms, userValue, selecteddateData, days, totalfare, startdate, enddate,
                    User_id, bookedUser, dob
                })


            } else {
                req.session.dateError = "Please enter the dates.."
                res.redirect("/user/user-home")

            }


        } else {
            req.session.dateError = "Please enter the dates.."
            res.redirect("/user/user-home")
        }


    } catch (error) {
        console.log("error pagee");
        console.log(error);
    }
}

//verify coupon code
const verifyCoupon = async (req, res) => {


    try {

        let user = req.session.user
        let coupon = req.body.couponcode
        let bookingcarId = req.body.carId


        isCouponActive = await couponModel.findOne({ couponCode: coupon });


        if (isCouponActive) {

            if (isCouponActive.limit <= 0) {
                console.log("Coupon is Expired....");
                await couponModel.findOneAndDelete({ couponCode: coupon })
            } else {
                isCouponUsed = await couponModel.findOne({
                    couponCode: coupon,
                    usedUsers: { $in: [user._id] },
                });

                if (isCouponUsed) {
                    let status = false
                    res.send(status)
                    console.log("you are already used the coupon...");
                } else {
                    if (new Date().getTime() >= new Date(isCouponActive.expirationTime).getTime()) {

                        await couponModel.findOneAndDelete({ couponCode: coupon })
                        console.log("The coupon in expired......");

                    } else {
                        req.session.totalfare = req.session.totalfare - isCouponActive.discount

                        await couponModel.updateOne(
                            { couponCode: coupon },
                            { $push: { usedUsers: user._id } }
                        );

                        await couponModel.findOneAndUpdate(
                            { couponCode: coupon },
                            { $inc: { limit: -1 } }
                        );
                        await carModel.findOneAndUpdate(
                            { _id: bookingcarId },
                            { $set: { couponDiscount: isCouponActive.discount } }
                        );
                    }

                    finalFare = req.session.totalfare
                    discount = isCouponActive.discount

                    console.log("Active");

                    res.json({ finalFare, discount })

                }
                let status = false
                res.send(status)
                console.log("Coupon Used");

            }

        } else {
            let status = false
            res.send(status)
            console.log("No coupon");
        }


    } catch (error) {
        console.log(error);
    }
}


// user id submit
const userIdSubmit = async (req, res) => {

    try {
        console.log(req.body);
        console.log(req.session.user);
        let userIdData = req.session.user

        const dataId = await userModel.findByIdAndUpdate({ _id: userIdData._id },
            {
                $set: {
                    dateofbirth: req.body.dob,
                    idCard: req.body.idcard,
                    idCardNo: req.body.idnumber,
                    drivingLicenceNo: req.body.licensenumber
                }
            })

        res.redirect("/user/checkout")
    } catch (error) {
        console.log(error);
    }
}

// search detials
const getSearchResults = async (req, res) => {

    try {

        let searchData = req.body
        console.table(req.body);

        const forserchData = await carModel.find({}).lean()

        res.render("user/search-resultpage", { searchData, forserchData })
    } catch (error) {
        console.log(error);
    }
}

// post search detials
const getSearchDetails = async (req, res) => {

    try {
    
        req.session.dateData = req.body

        res.redirect("/user/user-home")
        //const forserchData = await carModel.find({}).lean()
        //res.render("user/search-resultpage", { searchData,forserchData })
    } catch (error) {
        console.log(error);
    }
}




// get checkout page
const getCheckOutPage = async (req, res) => {

    try {

        res.render("user/payment")

    } catch (error) {
        console.log(error);
    }
}




//================================= User Booking ============================

const getBooking = async (req, res) => {

    try {
        let Car_id = req.body.Car_id;
        let User_id = req.body.User_id;

        await userModel.findByIdAndUpdate({ _id: User_id },
            {
                $set: {
                    dateofbirth: req.body.dob,
                    idCard: req.body.idcard,
                    idCardNo: req.body.idnumber,
                    drivingLicenceNo: req.body.licensenumber
                }
            })

        let bookedPlan = req.session.plan

        let bookedDate = req.session.selecteddateData
        let bookedTotalfare = req.session.totalfare

        let Bookedlocation = req.session.locationData
        let bookedUserData = await userModel.findById(User_id)
        let getbookedcarData = await carModel.findById(Car_id)

        const Bookings = new bookingModel({
            userId: User_id,
            carId: Car_id,
            modelname: getbookedcarData.modelname,
            bookedby: bookedUserData.name,
            pickupDateTime: bookedDate.startdate,
            dropoffDateTime: bookedDate.enddate,
            totalfare: bookedTotalfare,
            kmplan: bookedPlan,
            bookedlocation: Bookedlocation,
            extrafare: getbookedcarData.extrafare,
            deposit: getbookedcarData.deposit,
            Status: "Pending"
        });

        const bookedCar = await Bookings.save()
        generateRazorPay(bookedCar._id, bookedCar.totalfare).then((response) => {
            res.json(response)
        })

    } catch (error) {
        console.log(error.message);
    }
}


//================================= RazorPay ===================
const generateRazorPay = (orderId, total) => {

    return new Promise((resolve, reject) => {
        var options = {
            amount: total * 100,
            currency: "INR",
            receipt: "" + orderId,
        };
        instance.orders.create(options, function (err, order) {
            if (err) {
                console.log(err, "RazorPay Error");
            }

            resolve(order)
        })

    })
}




const changePaymentStatus = (bookingId, paymentData) => {

    let paidAmount = paymentData.order.amount / 100
    return new Promise(async (resolve, reject) => {
        const getbookedcarId = await bookingModel.findById(bookingId)

        let paidAmount = paymentData.order.amount / 100
        const booking = await bookingModel.updateMany({ _id: bookingId }, { $set: { Status: "Booked", paymentId: paymentData.payment.razorpay_payment_id, PaidAmount: paidAmount } })

        const changecarStatus = await carModel.updateOne({ _id: getbookedcarId.carId }, {
            $set: { isAvailable: false }


        }).then(() => {
            resolve()
        })
    })

}

//==================================== verifyPayment ======================
const verifyPayment = (details) => {


    return new Promise(async (resolve, reject) => {
        const {
            createHmac
        } = await import('node:crypto');

        let hmac = createHmac('sha256', process.env.RazorPaySecretKey);

        hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id);
        hmac = hmac.digest('hex')
        if (hmac == details.payment.razorpay_signature) {

            resolve(response)
        } else {

            reject()
        }

    })
}

const getOrderSuccessPage = async (req, res) => {
    try {
        res.render("user/booking-success", { layout: false })
    } catch (error) {
        console.log(error);
    }
}

const getOrderHistory = async (req, res) => {
    try {

        let userValue = req.session.user
        let userBookedDataCount = await bookingModel.find({ userId: userValue._id }).count()
        let userBookedData = await bookingModel.find({ userId: userValue._id }).lean()

        userBookedData.forEach(element => {
            element.date = moment(element.date).format('LLLL');
        });

        res.render("user/billing-order-history", { userValue, userBookedDataCount, userBookedData })
    } catch (error) {
        console.log(error);
    }
}

const getBookingngOrderHistory = async (req, res) => {
    try {

        let userValue = req.session.user

        let userBookedData = await bookingModel.find({ $and: [{ userId: userValue._id }, { Status: "Booked" }] }).sort({ date: -1 }).lean()

        userBookedData.forEach(element => {
            element.date = moment(element.date).format('LLLL');
            element.pickupDateTime = moment(element.pickupDateTime).format('LLLL');
            element.dropoffDateTime = moment(element.dropoffDateTime).format('LLLL');
        });

        res.render("user/booking-order-history", { userValue, userBookedData })
    } catch (error) {
        console.log(error);
    }
}

const cancelBooking = async (req, res) => {
    try {
        const cancelbookingId = req.query.id
        const cancelcarId = req.query.c

        let cancelledDate = new Date()
        await bookingModel.updateMany({ _id: cancelbookingId }, { $set: { Status: "Cancelled", bookingCancelledDate: cancelledDate } })
        await carModel.updateOne({ _id: cancelcarId }, { $set: { isAvailable: true } })
        res.redirect("/user/booking-order-history")
    } catch (error) {
        console.log(error);
    }
}


// GET user profile 
const getUserProfile = async (req, res) => {
    try {
        let userValue = req.session.user
        let userValueId = req.session.user._id

        let userProfileData = await userModel.findById(userValueId).lean()

        res.render("user/user-profile", { userValue, userProfileData, profileupdatedmsg: req.session.profileupdated })
        req.session.profileupdated = false;
    } catch (error) {
        console.log(error);
    }
}


// user edit page 
const editUserProfile = async (req, res) => {
    try {
        console.log(req.body);
        await userModel.updateOne({ _id: req.query.id }, {
            $set: {
                name: req.body.username,
                email: req.body.email,
                phonenumber: req.body.phonenumber,
            }
        })
        req.session.profileupdated = "Profile Updated Successfully"
        res.redirect("/user/user-profile")

    } catch (error) {
        console.log(error);
    }
}






// GET user change password 
const getUserChangePassword = async (req, res) => {
    try {

        let userValue = req.session.user
        // let userBookedData = await bookingModel.find({userId:userValue._id}).lean()

        res.render("user/user-changepassword", { userValue, passwordSuccess: req.session.passwordSuccess, passwordError: req.session.passwordError })
        req.session.passwordError = false
        req.session.passwordSuccess = false
    } catch (error) {
        console.log(error);
    }
}

// user change password 
const changeUserPassword = async (req, res) => {
    try {

        let userId = req.query.id
        let oldpassword = req.body.oldpassword
        let newpassword = req.body.newpassword

        let changePasswordData = await userModel.findById(userId)

        const isPasswordMatch = await bcrypt.compare(oldpassword, changePasswordData.password)

        if (isPasswordMatch) {

            if (oldpassword != newpassword) {
                const hashpassword = await securePassword(newpassword);

                await userModel.updateOne({ _id: userId }, {
                    $set: {
                        password: hashpassword
                    }
                })
                console.log("Password updated successfully");
                req.session.passwordSuccess = "Password updated successfully"
            } else {
                console.log("Use new password!!!!!");
                req.session.passwordError = "Use new password!!!!!"
            }

        } else {
            console.log("password not matched ");
            req.session.passwordError = "Invalid Password"
        }

        res.redirect("/user/changepassword")
    } catch (error) {
        console.log(error);
    }
}




// GET user id details
const getUserIddetails = async (req, res) => {
    try {
        let userValue = req.session.user
        let userValueId = req.session.user._id

        let userProfileData = await userModel.findById(userValueId).lean()

        let userDob = moment(userProfileData.dateofbirth).format('L');
        res.render("user/id-details", { userValue, userProfileData, profileupdatedmsg: req.session.profileupdated, userDob })
        req.session.profileupdated = false;
    } catch (error) {
        console.log(error);
    }
}


// GET Contact Us Page
const getContactUsPage = async (req, res) => {
    try {


        res.render("user/contactUs")

    } catch (error) {
        console.log(error);
    }
}

// GET about Us Page
const getAboutPage = async (req, res) => {
    try {


        res.render("user/aboutUs")

    } catch (error) {
        console.log(error);
    }
}




const filterSubmit = async (req, res) => {
    try {


        let filteredData = await carModel.find({})
        res.send("success")
    } catch (error) {
        console.log(error);
    }
}




// user logout
const getUserLogout = async (req, res) => {

    try {
        req.session.user = null
        req.session.userLoggedIn = false
        res.redirect("/")
    } catch (error) {
        console.log(error);
    }
}







module.exports = {
    homePageLoad, getSignupPage, insertUser, getUserhomePage, loginUser, getUserLogout,
    getSearchResults, getOtpPage, VerifyOTP, resendOtp, getUserResetPage, resetUserPassword, getContactUsPage, getAboutPage,
    getResetPage, updateNewPassword, getBookingSummaryPage, getSearchDetails, userIdSubmit, getCheckOutPage,
    getBooking, verifyPayment, getOrderSuccessPage, changePaymentStatus, getOrderHistory, cancelBooking, getUserProfile,
    getBookingngOrderHistory, getUserChangePassword, editUserProfile, getUserIddetails, changeUserPassword, verifyCoupon,
    filterSubmit

}