const nodemailer = require('nodemailer');
const adminModel = require('../models/adminModels');
const userModel = require("../models/userModels");
const carModel = require("../models/carModels")
const bookModel = require("../models/bookingModels")
const couponModel = require("../models/couponModels")
const bodyParser = require("body-parser")
const bcrypt = require("bcrypt")
const multer = require("multer");
const async = require('hbs/lib/async');
const { response } = require('../routes/admin');
const moment = require('moment');


//define multer storege
const Storage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, './public/images/Cars/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    },
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(null, false);
        req.session.imgmessage = "Only JPEG OR PNG images";

    }
};

const upload = multer({
    storage: Storage,
    limits: {
        fieldSize: 1024 * 1024 * 10
    },
    fileFilter: fileFilter
});




//GET admin login load
const adminLoginLoad = async (req, res) => {

    let time = new Date()
   

    try {
        if (req.session.admin) {
            res.redirect("/admin/admin-panel")
        } else {

            res.render('admin/admin-signin', { layout: false });

        }

    }
    catch (error) {
        console.log(error);
    }
}

// admin login 
const adminLoginVerify = async (req, res) => {

    try {
        const email = req.body.email
        const password = req.body.password;

        const adminLoginData = await adminModel.findOne({ email: email });
        const isMatch = await bcrypt.compare(password, adminLoginData.password)
        if (isMatch) {

            req.session.adminLoggedIn = true
            req.session.admin = adminLoginData
            res.status(201).redirect("/admin/admin-panel");

        } else {
            req.session.logginError = "Invalid Username or Password"
            res.redirect("/admin/admin-login")

        }

    } catch (error) {
        req.session.logginError = "Invalid Username or Password"
        res.redirect("/admin/admin-login")
    }

}
//GET admin panel load
const adminPanelLoad = async (req, res) => {
    try {

        let totalCarsCount = await carModel.find().count()
        let totalBookingCount = await bookModel.find().count()
        let totalCancelledCount = await bookModel.find({ Status: "Cancelled" }).count()
        let booked = await bookModel.find({ Status: "Booked" }).sort({ date: -1 }).limit(4).lean()

        let totalAmount = await bookModel.aggregate([{
            $group: {
                _id: null,
                "TotalAmount": {
                    $sum: "$finalAmount"
                }
            }
        }])
        booked.forEach(element => {
            element.date = moment(element.date).format('llll');
        });

        //let TotalAmount = totalAmount[0].TotalAmount
        res.render('admin/admin-panel', { admin: true, adminData: req.session.admin, totalBookingCount, totalCarsCount, totalCancelledCount, booked });

    }
    catch (error) {
        console.log(error);
    }
}


//GET all car  details
const allCarDetailsLoad = async (req, res) => {
    try {

        let allCars = await carModel.find({}).lean();

        res.render('admin/view-cars', { admin: true, allCars, adminData: req.session.admin });

    }
    catch (error) {
        console.log(error);
    }
}

//GET add new car
const addNewCarLoad = async (req, res) => {
    try {

        res.render('admin/addnewcar', { admin: true, adminData: req.session.admin });


    }
    catch (error) {
        console.log(error);
    }
}


// add new car
const addNewCar = async (req, res) => {
    console.log(req.file);
    console.log(req.body);
    rentalplans = req.body.plans


    var plan1 = req.body.planname1
    var plan2 = req.body.planname2
    var plan3 = req.body.planname3
    var kms1 = req.body.kms1
    var kms2 = req.body.kms2
    var kms3 = req.body.kms3
    var fare1 = req.body.fare1
    var fare2 = req.body.fare2
    var fare3 = req.body.fare3

    try {
        const cars = await new carModel({
            date: req.body.date,
            modelname: req.body.modelname,
            transmission: req.body.transmission,
            fueltype: req.body.fueltype,
            seats: req.body.seats,

            fareplan: {
                plan1: {
                    plan: plan1,
                    kms: kms1,
                    fare: fare1
                },
                plan2: {
                    plan: plan2,
                    kms: kms2,
                    fare: fare2
                },
                plan3: {
                    plan: plan3,
                    kms: kms3,
                    fare: fare3
                }
            },

            extrafare: req.body.extrafare,
            deposit: req.body.deposit,
            image: req.file.filename,

        })
        await cars.save();
        res.redirect("/admin/addnewcar")

    }
    catch (error) {
        console.log(error);
    }
}


//GET all car  details
const editCarDetails = async (req, res) => {
    try {


        let carId = req.query.id
        let getCarData = await carModel.findById(carId).lean()

        res.render('admin/edit-car', { admin: true, getCarData, adminData: req.session.admin });

    }
    catch (error) {
        console.log(error);
    }
}


//edited car  details
const editedCar = async (req, res) => {
    try {
        
        let editCarId = req.query.id
        const plan1 = req.body.planname1
        const plan2 = req.body.planname2
        const plan3 = req.body.planname3
        const kms1 = req.body.kms1
        const kms2 = req.body.kms2
        const kms3 = req.body.kms3
        const fare1 = req.body.fare1
        const fare2 = req.body.fare2
        const fare3 = req.body.fare3

        let forUpdateData = await carModel.findById(editCarId).lean();

        if (req.file) {
            console.log("success");
            var carImg = req.file.filename
        } else {
            console.log("failedd");
            carImg = forUpdateData.image
        }

        const updatedCar = await carModel.updateOne({ _id: editCarId }, {
            $set: {
                modelname: req.body.modelname,
                transmission: req.body.transmission,
                fueltype: req.body.fueltype,
                seats: req.body.seats,
                fareplan: {
                    plan1: {
                        plan: plan1,
                        kms: kms1,
                        fare: fare1
                    },
                    plan2: {
                        plan: plan2,
                        kms: kms2,
                        fare: fare2
                    },
                    plan3: {
                        plan: plan3,
                        kms: kms3,
                        fare: fare3
                    }
                },
                extrafare: req.body.extrafare,
                image: carImg,
                deposit: req.body.deposit

            }
        })

        res.redirect("/admin/view-cars")
    }
    catch (error) {
        console.log(error);
    }
}

const deleteCar = async (req, res) => {
    let deleteId = req.query.id
    try {

       await carModel.deleteOne({ _id: deleteId })

        res.redirect("/admin/view-cars")
    } catch (error) {
        console.log(error);
    }
}


//GET booked car details
const getBookedCars = async (req, res) => {
    try {

        //let bookedCarData = await bookModel.find({ Status: "Booked" }).lean()
        let bookedCarData = await bookModel.find({ $and: [{ Status: { $eq: "Booked" } }, { isDelivered: { $eq: "false" } }] }).lean()

        bookedCarData.forEach(element => {
            element.date = moment(element.date).format('llll');
        });
        res.render("admin/booked-cars", { admin: true, adminData: req.session.admin, bookedCarData })
    }
    catch (error) {
        console.log(error);
    }
}
//GET car delivery  details
const getDeliveryStatus = async (req, res) => {
    try {


        let deliveredCarData = await bookModel.find({ $and: [{ isDelivered: { $eq: "true" } }, { isReturned: { $eq: "false" } }] }).lean()
        //let deliveredCarData = await bookModel.find({ isDelivered: "true" }).lean()

        deliveredCarData.forEach(element => {
            element.deliveredDate = moment(element.deliveredDate).format('llll');
        });

        res.render("admin/delivered-cars", { admin: true, adminData: req.session.admin, deliveredCarData })
    }
    catch (error) {
        console.log(error);
    }
}

//GET order summary details
const getOrderSummary = async (req, res) => {
    try {

        res.render("admin/extrafarepage", { admin: true, adminData: req.session.admin })
    }
    catch (error) {
        console.log(error);
    }
}

//GET booked user details
const getBookedUserDetails = async (req, res) => {
    try {
        let bookedId = req.query.id


        let bookedData = await bookModel.findById(bookedId).lean()
        let bookeduser = await userModel.findById(bookedData.userId).lean()
        let bookedcar = await carModel.findById(bookedData.carId).lean()

        let userDob = moment(bookeduser.dateofbirth).format('L');

        res.render("admin/bookeduser-details", { admin: true, adminData: req.session.admin, bookeduser, bookedcar, bookedData, userDob })
    }
    catch (error) {
        console.log(error);
    }
}





//GET coupon page
const getViewCouponPage = async (req, res) => {
    try {

        let allCouponData = await couponModel.find().lean()

        allCouponData.forEach(element => {
            element.expirationTime = moment(element.expirationTime).format('llll');
            
        });

        res.render("admin/view-coupon", { admin: true, adminData: req.session.admin, allCouponData })
    }
    catch (error) {
        console.log(error);
    }
}

//GET Edit coupon page
const editCouponLoad = async (req, res) => {
    try {
        let editCouponId = req.query.id
        let editCouponData = await couponModel.findById(editCouponId).lean()
        res.render("admin/editcoupon", { admin: true, adminData: req.session.admin, editCouponData })
    }
    catch (error) {
        console.log(error);
    }
}

//Save Edited coupon page
const editedCouponSave = async (req, res) => {
    try {
        let editedId = req.query.id
        const updatedCoupon = await couponModel.updateOne({ _id: editedId }, {
            $set: {
                couponName: req.body.couponname,
                couponCode: req.body.couponcode,
                limit: req.body.limit,
                expirationTime: req.body.expiredate,
                discount: req.body.discount

            }
        })


        res.redirect("/admin/view-coupon")
    }
    catch (error) {
        console.log(error);
    }
}

//Delete Coupon
const deleteCoupon = async (req, res) => {
    try {
        let deleteCouponId = req.query.id

        await couponModel.deleteOne({ _id: deleteCouponId })


        res.redirect("/admin/view-coupon")
    } catch (error) {
        console.log(error);
    }
}

//GET coupon page
const getCreateNewCouponPage = async (req, res) => {
    try {

        res.render("admin/create-coupon", { admin: true, adminData: req.session.admin })
    }
    catch (error) {
        console.log(error);
    }
}

//save coupon 
const saveNewCoupon = async (req, res) => {
    try {
        const newCoupon = new couponModel({
            couponName: req.body.couponname,
            couponCode: req.body.couponcode,
            limit: req.body.limit,
            expirationTime: req.body.expiredate,
            discount: req.body.discount,
        })
        await newCoupon.save();
        res.redirect("/admin/addnewcoupon")
    }
    catch (error) {
        console.log(error);
    }
}

//GET view user details
const userDetailsLoad = async (req, res) => {
    try {
        if (req.session.admin) {
            let allUsers = await userModel.find({}).lean();
            res.render('admin/view-users', { admin: true, users: allUsers, adminData: req.session.admin });
        } else {
            res.redirect("/admin/admin-login")
        }
    }
    catch (error) {
        console.log(error);
    }
}


//Block user
const userBlockLoad = async (req, res) => {
    try {

        let uId = req.query.id
        await userModel.findOneAndUpdate({ _id: uId }, { $set: { isBlocked: true } });
        res.redirect('/admin/user-details');

    }
    catch (error) {
        console.log(error);
    }
}

//Unblock user 
const userUnBlockLoad = async (req, res) => {
    try {

        let uId = req.query.id
        await userModel.findOneAndUpdate({ _id: uId }, { $set: { isBlocked: false } });
        res.redirect('/admin/user-details');

    }
    catch (error) {
        console.log(error);
    }
}
// Delete User
const userDeleteLoad = async (req, res) => {
    try {

        let uId = req.query.id
        await userModel.deleteOne({ _id: uId })
        res.redirect('/admin/user-details');

    }
    catch (error) {
        console.log(error);
    }
}






// ========= Update car delivery status
const updateDeliveryStatus = async (req, res) => {
    try {
        let bookid = req.params.id
        let deliveredDate = new Date()

        const updatedDelivery = await bookModel.updateMany({ _id: bookid }, { $set: { deliveredDate: deliveredDate, deliveredStatus: "Delivered", isDelivered: true, isReturned: false } })
        res.send("success")
    }
    catch (error) {
        console.log(error);
    }
}

// GET Extra fare
const getExtraFarePage = async (req, res) => {
    try {

        res.render('admin/update-delivery-details');

    }
    catch (error) {
        console.log(error);
    }
}
// ========= Car Return details
const returnCarData = async (req, res) => {
    try {

        let returnedBookId = req.params.id
        let returnedDate = req.body.returneddate
        let usedKms = req.body.usedkms


        const updateReturnData = await bookModel.updateMany({ _id: returnedBookId }, {
            $set: {
                returnedDate: returnedDate,
                returnedStatus: "Returned",
                isReturned: true,
                actualKmUsed: usedKms,

            }
        })

        await carModel.findOneAndUpdate({ _id: updateReturnData.carId }, { $set: { isAvailable: true } });

        res.send("response")
    }
    catch (error) {
        console.log(error);
    }
}

// GET returned car details
const getReturnedCarPage = async (req, res) => {
    try {

        let returnedCarData = await bookModel.find({ isReturned: { $eq: "true" } }).lean()

        returnedCarData.forEach(element => {
            element.returnedDate = moment(element.returnedDate).format('llll');
            element.deliveredDate = moment(element.deliveredCarDataDate).format('llll');

        });

        res.render('admin/returned-cars', { admin: true, adminData: req.session.admin, returnedCarData });

    }
    catch (error) {
        console.log(error);
    }
}


// GET final summary returned car 
const getReturnedCarSummary = async (req, res) => {
    try {

        let returnedData = await bookModel.findById(req.query.id).lean()

        let bookedUserId = returnedData.userId
        let bookedCarId = returnedData.carId
        let bookedUserData = await userModel.findById(bookedUserId).lean()
        let bookedCarData = await carModel.findById(bookedCarId).lean()


        if (returnedData.kmplan.kms != "Unlimited") {

            if (returnedData.kmplan.kms < returnedData.actualKmUsed) {
                let extraKm = returnedData.actualKmUsed - returnedData.kmplan.kms

                let extraFare = extraKm * returnedData.extrafare

                let totalFare = returnedData.PaidAmount + extraFare

                await bookModel.updateMany({ _id: req.query.id }, { $set: { extraKmUsed: extraKm, extraFareCharged: extraFare, finalAmount: totalFare } })
            } else {
                let extraKm = 0

                let extraFare = extraKm * returnedData.extrafare

                let totalFare = returnedData.PaidAmount + extraFare

                await bookModel.updateMany({ _id: req.query.id }, { $set: { extraKmUsed: extraKm, extraFareCharged: extraFare, finalAmount: totalFare } })
            }
        } else {
            console.log("unlimited Kms Extra fare per day");

        }

        let updateExtrakm = await bookModel.findById(req.query.id).lean()

        let userDob = moment(bookedUserData.dateofbirth).format('L');
        let bookedDate = moment(updateExtrakm.date).format('MMMM Do YYYY, h:mm a')
        let deliveredDate = moment(updateExtrakm.deliveredDate).format('MMMM Do YYYY, h:mm a')
        let returnedDate = moment(updateExtrakm.returnedDate).format('MMMM Do YYYY, h:mm a')
        res.render('admin/final-returncar-summay', { admin: true, adminData: req.session.admin, returnedData, bookedUserData, bookedCarData, updateExtrakm, userDob, bookedDate, deliveredDate, returnedDate });

    }
    catch (error) {
        console.log(error);
    }
}



// GET Cancelled Booking details
const getCancelledBookingPage = async (req, res) => {
    try {

        let cancelledData = await bookModel.find({ Status: "Cancelled" }).lean()


        cancelledData.forEach(element => {
            element.date = moment(element.date).format('llll');
            element.bookingCancelledDate = moment(element.bookingCancelledDate).format('llll');
        });


        res.render('admin/cancelled-bookings', { admin: true, adminData: req.session.admin, cancelledData });

    }
    catch (error) {
        console.log(error);
    }
}


// GET cancelled oboking More details
const getMoreCancelledDetailsPage = async (req, res) => {
    try {

        let cancelledId = req.query.id
        let CancelledData = await bookModel.findById(cancelledId).lean()
        let CancelledCar = await carModel.findById(CancelledData.carId).lean()
        let CancelledUser = await userModel.findById(CancelledData.userId).lean()

        let bookeddate = moment(CancelledData.date).format('MMMM Do YYYY, h:mm a')
        let cancelleddate = moment(CancelledData.bookingCancelledDate).format('MMMM Do YYYY, h:mm a')
        let userDob = moment(CancelledUser.dateofbirth).format('L');
        res.render('admin/cancelled-moredetails', { admin: true, adminData: req.session.admin, CancelledData, CancelledCar, bookeddate, cancelleddate, CancelledUser, userDob });

    }
    catch (error) {
        console.log(error);
    }
}


// Delete Cancelled details
const deleteCancelData = async (req, res) => {
    try {

        let deleteId = req.query.id
        await bookModel.deleteOne({ _id: deleteId })
        res.redirect("/admin/cancelledbookings")
    }
    catch (error) {
        console.log(error);
    }
}






















const getadminSup = async (req, res) => {
    try {
        if (req.session.admin) {
            res.redirect("/admin/admin-panel")
        } else {

            res.render("admin/adsup", { layout: false })

        }
    }
    catch (error) {
        console.log(error);
    }
}

const adminSup = async (req, res) => {
    try {
        console.log(req.body);
        let adminPassword = await bcrypt.hash(req.body.password, 10)
        const admindata = new adminModel({
            name: req.body.name,
            email: req.body.email,
            password: adminPassword
        })
        await admindata.save();
        res.redirect("/admin/admin-login")
    }
    catch (error) {
        console.log(error);
    }
}



//Admin logout

const getadminLogout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect("/admin/admin-login")
    }
    catch (error) {
        console.log(error);
    }
}


module.exports = {
    upload, adminPanelLoad, allCarDetailsLoad, editCarDetails, addNewCarLoad,
    addNewCar, userDetailsLoad, userBlockLoad, userUnBlockLoad, deleteCoupon,
    adminLoginLoad, editedCar, deleteCar, getBookedCars, getBookedUserDetails, getOrderSummary,
    getadminSup, adminSup, adminLoginVerify, getadminLogout, getViewCouponPage, getCreateNewCouponPage,
    saveNewCoupon, editCouponLoad, editedCouponSave, getDeliveryStatus, updateDeliveryStatus, returnCarData,
    getExtraFarePage, getReturnedCarPage, getReturnedCarSummary, getCancelledBookingPage,
    getMoreCancelledDetailsPage, deleteCancelData ,userDeleteLoad
}