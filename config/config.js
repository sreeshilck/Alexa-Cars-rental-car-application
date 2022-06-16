const { default: mongoose } = require("mongoose");


mongoose.connect(process.env.MONGO_URL,{useNewUrlparser:true})
.then(()=>console.log("db connection successful"))
.catch((err)=>console.log("db connection failed"))