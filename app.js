var express = require("express");
var app = express();
var bodyParser = require("body-parser");//to convert string page to object from html page
var mongoose=require("mongoose");
//mongoose.connect("mongodb://127.0.0.1/renclo",{useNewUrlParser:true,useUnifiedTopology:true});//connect database
mongoose.connect("mongodb+srv://nik:nik@cluster0-5tolk.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology:true});//connect database cloud
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine","ejs");//to attach .ejs to every html page
app.use(express.static('public'));//to access images or other resources
var comment=require("./models/comment");
var product=require("./models/product");
var user=require("./models/user.js");
var order=require("./models/order.js");
var passport=require("passport");//for Authentication
var localstratedy=require("passport-local");
var passportlocalmongoose=require("passport-local-mongoose");
var expresssession=require("express-session");
var methodoverride=require("method-override")//for using put delete as method
app.use(methodoverride("_method"));
var flash=require("connect-flash")
app.use(flash());
var paypal = require('paypal-rest-sdk');
mongoose.set("useCreateIndex",true);
mongoose.set("useFindAndModify",false);
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AfU1P-z8Ru-BPj-d_k-5dMPF525retH4JLrYu0zHnquywzADuqJHKke8fyqBBNXb4Tami_-wfd4xysvV',
  'client_secret': 'EASW_hjsgQuGAWr3cWvAqovgT4_3JJbAdYGEEo2eV1msB0al9oW1Q3nK_qDvVn9Z4FTn48PkiDjWFzsT'
});
///////////////Authentication///////////////////////////////
app.use(expresssession({//to encode                       //
  secret:"i am the best coder",                           //
  resave:false,                                           ///
  saveUninitialized:false                                 //
}));                                                      //
                                                          //
app.use(passport.initialize());//to initialize passport   //
app.use(passport.session()); //to create session in pages //
passport.use(new localstratedy(user.authenticate()));     //to use local as localstratedy
passport.serializeUser(user.serializeUser());             //decode
passport.deserializeUser(user.deserializeUser());         //encode
                                                          //
////////////////////////////////////////////////////////////
app.use(function (req,res ,next) {//to pass userinformation in every page
  res.locals.currentuser=req.user//sets currrent user if its empty sets undefined
  res.locals.error=req.flash("error");//sets error and if its empty sets []
  res.locals.success=req.flash("success");
  next();
})
/////////////Routes////////////////////////////////////////

app.get("/", function(req, res){//landing page
  product.find({},function(error,retrivedproduct){
    if (error) {
      console.log(error);
    }else{
      res.render("index",{retrivedproduct:retrivedproduct});
    }
  })

});

app.get("/about", function(req, res){//about page
    res.render("about");
});

app.get("/contact", function(req, res){//contact page
    res.render("contact");
});

app.get("/register", function(req, res){//register get page
    res.render("account");
});

app.post("/register",function(req,res){//register post route
  var newuser=new user({username:req.body.username,fullname:req.body.fullname,email:req.body.email,code:req.body.code,phoneno:req.body.phoneno})
  if(req.body.code==="teranaam"){
newuser.isadmin=true;
  }
  user.register(newuser,req.body.password,function(error,usersaved){//registering new user
    if (error) {
      req.flash("error",error.message)
      res.redirect("/register")
    }else{

      passport.authenticate("local")(req,res,function(){//crating sessions
        req.flash("success","successfully signed up")
        res.redirect("/")
      })
    }
  })
});

app.get("/search",function(req,res){//search route
   const regex = new RegExp(escapeRegex(req.query.search), 'gi');//for searchinng in product database
  product.find({title:regex},function(error,searchedproduct){
    if (error) {

      res.redirect("/product")
    }else{
      if(searchedproduct.length<1)
      {

          req.flash("error","No Items Found")
          res.redirect("/product")
      }else
      {
      console.log(searchedproduct);
      res.render("product",{retrivedproduct:searchedproduct})
    }}
});
});

app.get("/login",function(req,res) {//login page
res.render("login");
});

app.post("/login",passport.authenticate("local",{successRedirect:"/",failureRedirect:"/",failureFlash:"Username or Password Incorrect",successFlash:"LoggedIn successfully"}),function (req,res) {//authenticating

});

app.get("/logout",function (req,res) {//logout page
req.logout()//function to logout
req.flash("success","Logged out!!")
res.redirect("/");
});

app.post("/newproduct",isloggedin,function(req,res){//creating new product route
  var newproduct={tag:req.body.tag,title:req.body.title,rating:req.body.rating,disc:req.body.disc,price:req.body.price,image:req.body.image,category:req.body.category}
product.create(newproduct,function(error,savedproduct){
  if (error) {
    console.log(error);
  }else{
    req.flash("success","added product")
    res.redirect("/product")
  }
})
});

app.get("/newproduct",isloggedin, function(req, res){//creatiing new product page
    res.render("newproduct");
});

app.get("/product", function(req, res){// all products page
  product.find({},function(error,retrivedproduct){
    if (error) {
console.log(error);
}else {
  res.render("product",{retrivedproduct:retrivedproduct});//sending datatbase file to page
}
});
});

app.get("/product/:id/edit",isloggedin,function(req,res){
  product.findById(req.params.id,function(error,foundproduct){
    if (error) {
      console.log("error");
    }else{
      res.render("editproduct",{respectiveproduct:foundproduct})
    }
  })

});


app.put("/product/:id/edit",isloggedin,function (req,res) {
var newproduct={tag:req.body.tag,title:req.body.title,rating:req.body.rating,disc:req.body.disc,price:req.body.price,image:req.body.image,category:req.body.category}
  product.findByIdAndUpdate(req.params.id,newproduct,function(error,updatedproduct){
if (error) {
  res.send("error");
}else{
  req.flash("success","successfully updated")
  res.redirect("/product")
}
  })

});

app.delete("/delete/:id",isloggedin,function(req,res){//deleting product
  console.log(req.params.id);
  product.findByIdAndRemove(req.params.id,function(error){//for deleting
    if (error) {
      res.redirect("error")
    }else{

      res.redirect("/product")
    }
  })
});

app.get("/product/:id", function(req, res){//showing respective product page
  product.findById(req.params.id).populate("comment").exec(function(error,respectiveproduct) {
    if (error) {
      res.redirect("/product");
    }else {

      res.render("productdetail",{respectiveproduct:respectiveproduct});
    }
  })

});

app.post("/product/:id/comment",isloggedin,function (req,res) {//creating new comment for product
  var author={id:req.user._id,commentusername:req.user.username}
  var com={author:author,comment:req.body.comment,rating:req.body.rating}
  comment.create(com,function (error,createdcomment) {
    if (error) {
      console.log(error);
    }else {
      product.findById(req.params.id,function(error,foundproduct) {
        if (error) {
          console.log(error);
        }else {
          foundproduct.comment.push(createdcomment);//pushing ids of comments
          foundproduct.save();//saving
          res.redirect("/product/"+req.params.id)
        }
      })
    }
  })
});

app.delete("/product/:id/comment/:commentid/delete",isloggedin,function(req,res){//deleting comment
  console.log(req.params.commentid);
  comment.findByIdAndRemove(req.params.commentid,function(error){//for deleting
    if (error) {
      res.redirect("error")
    }else{
      res.redirect("/product/"+req.params.id)
    }
  })
});

app.get("/category/:id",function(req,res){//displaying product by there category
  var men="men"
console.log(req.params.id);
  if(req.params.id=="women"){
    product.find({category:"women"},function(error,retrivedproduct){
      if (error) {
  console.log(error);
  }else {
    res.render("product",{retrivedproduct:retrivedproduct});//sending datatbase file to page
  }
  });
}else if (req.params.id=="men") {
  console.log("entered");
  product.find({category:"men"},function(error,retrivedproduct){
    if (error) {
console.log(error);
}else {
  res.render("product",{retrivedproduct:retrivedproduct});//sending datatbase file to page
}
});
}else if (req.params.id=="kid") {
  product.find({category:"kid"},function(error,retrivedproduct){
    if (error) {
console.log(error);
}else {
  res.render("product",{retrivedproduct:retrivedproduct});//sending datatbase file to page
}
});
}
});
app.post("/order/:id/submit",function(req,res){

  product.findById(req.params.id,function(error,product){
    if (error) {
      console.log("err");
    }else{
          var price=product.price;
          var p=(parseInt(price))*(parseInt(req.body.day,10));
          var neworder={
            productid:req.params.id,
            day:req.body.day,
            size:req.body.size,
            email:req.body.email,
            address:req.body.address,
            phoneno:req.body.phoneno,
            firstname:req.body.firstname,
            lastname:req.body.lastname,
            price:price,
            totalprice:p,
            image:product.image,
            title:product.title
                        }
        order.create(neworder,function(error,createdorder){
          if (error) {
              console.log(error);
              res.redirect("/product/"+req.params.id)

                      }
          else{
            if(req.body.optionRadio==1){
                  res.redirect("/success")
                                        }
              }
  })

}
})
});

app.get("/ordermanage",isloggedin,function(req,res){

order.find({},function(error,order){
  if (error) {
    console.log(error);
  }else{
    res.render("ordermanage",{order:order})
  }
});
});

app.delete("/order/:id/delete",isloggedin,function(req,res){//deleting comment
  console.log(req.params.id);
  order.findByIdAndRemove(req.params.id,function(error){//for deleting
    if (error) {
      res.redirect("error")
    }else{
      res.redirect("/ordermanage")
    }
  })
});
app.get("/account/:id",isloggedin, function(req, res){//showing respective product page
  user.findById(req.params.id,function(error,retriveduser) {
    if (error) {
      res.redirect("/");
    }else {
console.log(retriveduser);

      res.render("myaccount",{retriveduser:retriveduser});
    }
  })

});
app.delete("/account/:id/delete",isloggedin,function(req,res){//deleting product

  user.findByIdAndRemove(req.params.id,function(error){//for deleting
    if (error) {
      res.redirect("error")
    }else{
req.flash("success","Account Deleted Successfully");
      res.redirect("/")
    }
  })
});

function escapeRegex(text) {//function used by regex search for searching products
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

function isloggedin(req,res,next) {//middlewarefunction
  if (req.isAuthenticated()) {//checting isAuthenticated true
    return next();//short circuting function
  }
  else {
    req.flash("error","you are not logged in")
res.redirect("/login")
  }

}
app.get("/success",function(req,res){
  res.render("success")
})





app.get("*", function(req, res){//landing page
    res.render("index");
});
var port=process.env.PORT||3000;//to work in heroku server
app.listen(port, function(){//listens to port 3000
   console.log("the Renclo server started!...");
});
//heroku for hosting website
//mlab for hosting database
//git for pushing files to heroku from our computer
//functions--
//git add : to add files in git
 //git status :to know status of git
 //git commit -m "detial":to commit that means to add checkpoint
 //git push heroku master:to transfer files from .git folder to heroku server and here master is checkpoint(latest)
//git checkout branchname: to make sure correct local branch is Checkout
//git push -u origin develop : tracking connection
