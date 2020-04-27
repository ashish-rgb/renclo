var mongoose=require("mongoose");
// database schema....
var commentSchema = new mongoose.Schema({
  comment:String,
  rating:String,
  author:{
    id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
  },
    commentusername:String
  }
});
//database model.....

var comment= mongoose.model("comment",commentSchema);
module.exports=comment;
