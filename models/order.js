var mongoose=require("mongoose");
 var orderSchema=new mongoose.Schema({
  day:{type:Number,default:1},
  size:{type:String,default:"s"},
  productid:{
    type:mongoose.Schema.Types.ObjectId,
  ref:"product"},
  address:String,
  email:String,
  phoneno:String,
  firstname:String,
  lastname:String
})

 var order=mongoose.model("order",orderSchema);

 module.exports=order;
