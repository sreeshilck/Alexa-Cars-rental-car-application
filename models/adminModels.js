const mongoose = require("mongoose");
const async = require("hbs/lib/async");

const adminSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true


    }
});


const Admin_Register = new mongoose.model("Admin_Register",adminSchema);
module.exports=Admin_Register