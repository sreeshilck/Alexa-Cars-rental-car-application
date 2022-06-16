const mongoose = require("mongoose")
const Schema = mongoose.Schema
const moment = require("moment")

const bookingSchema = new mongoose.Schema({
    date:{
        type:Date,
        default:Date.now
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:'User_Register'
    },
    carId:{
        type:Schema.Types.ObjectId,
        ref:'Car_Register'
    },
    modelname:{ 
        type:String
    },
    bookedby:{
        type:String
    },
    pickupDateTime:{
        type:Date,
        
    },
    dropoffDateTime:{
        type:Date,
        
    },
    bookedlocation:{
        type:Object
    },
    totalfare:{
        type:Number
    },
    kmplan:{
        type:Object
    },
    extrafare:
    {
        type:Number
    },
    deposit:{
        type:Number
    },
    Status:{
        type:String
    },
    paymentId:{
        type:String
    },
    isDelivered:{
        type:Boolean,
        default:false
    },
    deliveredDate:{
        type:Date,
        
    },
    deliveredStatus:{
        type:String
    },
    isReturned:{
        type:Boolean,
        default:true
    },
    returnedDate:{
        type:Date
    },
    returnedStatus:{
        type:String,
    },
    actualKmUsed:{
        type:Number
    },
    extraKmUsed:{
        type:Number
    },
    extraFareCharged:{
        type:Number
    },
    couponDiscount:{
        type:Number
    },
    PaidAmount:{
        type:Number
    },
    finalAmount:{
        type:Number
    },
    isbookingCancelled:{
        type:Boolean,
        default:false
    },
    bookingCancelledDate:{
        type:Date,
    }
    


})


module.exports = mongoose.model("Booking_Register",bookingSchema);