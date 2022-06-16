const async = require("hbs/lib/async");

const userAuth =async (req,res,next)=>{
    if(req.session.user){
        next();
    } else{
        res.redirect("/")
    }
}

module.exports = {
    userAuth
}