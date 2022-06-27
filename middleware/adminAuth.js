const async = require("hbs/lib/async");

const adminAuth =async (req,res,next)=>{
    if(req.session.admin){
        next();
    } else{
        res.redirect("/")
    }
}

module.exports = {
    adminAuth
}