const mongoose = require("mongoose");


const carSchema=new mongoose.Schema({
    date:{
        type:Date,
        default:Date.now
    },
    
    modelname:{
        type:String,
        required:true
    },
    transmission:{
        type:String,
        required:true
        
    },
    fueltype:{
        type:String,
        required:true
    },
    seats:{
        type:Number,
        required:true
    },
    fareplan:{
        type:Array,
        required:true
         
    },
    extrafare:{
        type:String,
        require:true
    },
    
    image:{
        type:String,
        required:true
    },
    deposit:{
        type:Number,
        require:true
    },
    couponDiscount:{
        type:Number
    },
    isAvailable:{
        type:Boolean,
        default:true
    }

});




module.exports = mongoose.model("Car_Register",carSchema);