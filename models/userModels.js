const mongoose = require("mongoose");
const moment = require("moment")

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    phonenumber:{
        type:Number,
        require:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    dateofbirth:{
        type:Date,
        trim:true,
    },
    idCard:{
        type:String
    },
    idCardNo:{
        type:Number,
        trim:true
    },
    drivingLicenceNo:{
        type:String,
        trim:true
    },
    isPhoneVerified:{
        type:Boolean,
        default:false
    },
     isBlocked:{
         type:Boolean,
         default:false
     },

    
});




module.exports = mongoose.model("User_Register",userSchema);