var mongoose=require("mongoose");
var passportlocalmongoose=require("passport-local-mongoose");
 var userSchema=new mongoose.Schema({
   fullname:{type:String,required:true,index:{unique:false}},
   phoneno:{type:String,required:true,index:{unique:false}},
   email:{type:String,required:true,index:{unique:false}},
   username:{type:String,required:true,index:{unique:true}},
   password:String,
   isadmin:{type:Boolean,default:false}
 });
 userSchema.plugin(passportlocalmongoose)//creates username behind the scenes so only use where aunthentication is needed
 var user=mongoose.model("user",userSchema);

 module.exports=user;
