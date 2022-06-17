const express = require('express');
const adminRouter = express();
const bodyParser = require('body-parser')
const adminController = require('../controller/adminController')
const Auth = require('../middleware/adminAuth')

adminRouter.use(bodyParser.urlencoded({extended:true}));
adminRouter.use(bodyParser.json());


//GET admin login
adminRouter.get('/admin-login', adminController.adminLoginLoad);
//GET admin login
adminRouter.post('/adminverify', adminController.adminLoginVerify);


//GET admin dashboard 
adminRouter.get('/admin-panel',Auth.adminAuth, adminController.adminPanelLoad);

//GET view all cars
adminRouter.get('/view-cars',Auth.adminAuth, adminController.allCarDetailsLoad);
//GET Edit car page
adminRouter.get('/edit-car',Auth.adminAuth, adminController.editCarDetails);
// update  car details
adminRouter.post('/updatecar',adminController.upload.single("image"), adminController.editedCar);
//delete car
adminRouter.get('/delete-car', adminController.deleteCar);


//GET add new car
adminRouter.get('/addnewcar',Auth.adminAuth, adminController.addNewCarLoad);
// submit new car 
adminRouter.post('/newcar', adminController.upload.single("image"),adminController.addNewCar);

//GET booked car data
adminRouter.get('/bookedcars',Auth.adminAuth, adminController.getBookedCars);
//GET deliverd status
adminRouter.get('/deliveredcars',Auth.adminAuth, adminController.getDeliveryStatus);
// update deliverd status
adminRouter.post('/updatedelivery/:id/', adminController.updateDeliveryStatus);

// GET cancelled car details
adminRouter.get('/cancelledbookings',Auth.adminAuth, adminController.getCancelledBookingPage);
// GET cancelled car more  details
adminRouter.get('/cancelleddetails',Auth.adminAuth, adminController.getMoreCancelledDetailsPage);
// Delete cancelled  details
adminRouter.get('/deletecancel', adminController.deleteCancelData);


//GET deliverd status
adminRouter.get('/update-extra',Auth.adminAuth, adminController.getExtraFarePage);
//post update Extra fare details
adminRouter.post('/returndata/:id', adminController.returnCarData);


//GET returned car details
adminRouter.get('/returnedcars',Auth.adminAuth, adminController.getReturnedCarPage);
//GET final summary returned car
adminRouter.get('/returnedcar-summary',Auth.adminAuth, adminController.getReturnedCarSummary);




//GET order summary - extafare
adminRouter.get('/ordersummary',Auth.adminAuth, adminController.getOrderSummary);

//GET booked car user details data
adminRouter.get('/bookeddetails',Auth.adminAuth, adminController.getBookedUserDetails);



//GET coupon page
adminRouter.get('/view-coupon',Auth.adminAuth, adminController.getViewCouponPage);
//GET edit coupon
adminRouter.get('/edit-coupon/', Auth.adminAuth, adminController.editCouponLoad);
// edited coupon
adminRouter.post('/editedcoupon',  adminController.editedCouponSave);

// Delete  Coupon
adminRouter.get('/delete-coupon',  adminController.deleteCoupon);

//GET create new coupon page
adminRouter.get('/addnewcoupon',Auth.adminAuth, adminController.getCreateNewCouponPage);

//  new coupon submit
adminRouter.post('/newcoupon',Auth.adminAuth, adminController.saveNewCoupon);



//GET view user-details
adminRouter.get('/user-details', adminController.userDetailsLoad);
//Block user
adminRouter.get('/block-user/', adminController.userBlockLoad);
//Unblock user
adminRouter.get('/unblock-user/', adminController.userUnBlockLoad);
//delete user
adminRouter.get('/delete-user/', adminController.userDeleteLoad);



//admin logout
adminRouter.get('/admin-logout', adminController.getadminLogout);

//ad sup
adminRouter.get('/adsup', adminController.getadminSup);
//adsup post
adminRouter.post('/adminup', adminController.adminSup);




module.exports = adminRouter;
