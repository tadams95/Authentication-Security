//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require ("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

//console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
    extended: true
}));

//use the session package with initial configuration
app.use(session({
    secret: "THISISOURLITTLESECRET",
    resave: false,
    saveUninitialized: false,
}));

//initialize passport and use passport to deal with the session. 
//check passportjs docs for more information
app.use(passport.initialize());
app.use(passport.session());

//we can use studio3T to view this database
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});


const userSchema = new mongoose.Schema ({
    email: String,
    password: String
});

//used to hash and salt our passwords
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req,res){
    res.render("home");
});

app.get("/login", function(req,res){
    res.render("login");
});

app.get("/register", function(req,res){
    res.render("register");
});

app.get("/secrets", function(req,res){
    if (req.isAuthenticated()){
        res.render("/secrets");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", function(req,res){
    req.logOut();
    res.redirect("/");
});

app.post("/register", function(req,res){

    User.register({username: req.body.username}, req.body.password, function(err, user){
        if (err) {
            console.log(err)
            res.redirect("/register");
        } else {
            //set up a logged in session for the user, should be automatically able to view /secrets page if still logged in
            passport.authenticate("local")(req,res, function(){
                res.render("secrets");
            });
        }
    });
});

app.post("/login", function(req,res){
   
    const user = new User({
        username: req.body.username,
        password: req.body.passport
    });

    req.login(user, function(err){
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req,res, function(){
                res.render("secrets");
            });
        }
    });
});



app.listen(3000, function() {
    console.log("Server started on port 3000");
});