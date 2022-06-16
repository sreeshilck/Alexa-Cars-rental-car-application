const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

// creating objectSchema

const couponCodeSchema = new Schema({
    couponName: {
        type: String,
        min: 4,
        max: 10,
        trim: true,
        required: true,
    },
    couponCode:{
        type:String,
        min: 5,
        max: 10,
        trim: true,
        required: true,
        unique:true,
    },
    limit:{
        type:Number
    },
    discount: {
        type: String,
    },
    createdAt: {
        type: Date,
        default:Date.now
  
    },
    updatedAt: {
        type: Date,
        
    },
    expirationTime: {
        type: Date,
        required: true,
    },
    usedUsers:{
        type:Array,
    }
       
});


module.exports = mongoose.model("Coupon_Register",couponCodeSchema);    
