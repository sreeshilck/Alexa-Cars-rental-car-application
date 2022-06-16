const mongoose = require("mongoose");
// const bcrypt =require("bcrypt");
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


// //password hashing

// adminSchema.pre("save",async function(next){
//     if(this.isModified("password")){
//         this.password=await bcrypt.hash(this.password,10)
//         this.confirmpassword=await bcrypt.hash(this.password,10)
//     }
//     next();
// })


const Admin_Register = new mongoose.model("Admin_Register",adminSchema);
module.exports=Admin_Register