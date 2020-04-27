var mongoose=require("mongoose");
 var productSchema=new mongoose.Schema({
   category:String,
   title:String,
   image:String,
   rating:String,
   disc:String,
   price:String,
   comment:[{
     type: mongoose.Schema.Types.ObjectId,
     ref:"comment"
   }],
   tag:String

 });
 var product=mongoose.model("product",productSchema);

 module.exports=product;
