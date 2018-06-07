var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './uploads' });
var bodyParser = require('body-parser');
var user = require('../model/user');
var data = require('../model/data');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var methodOverride = require('method-override');
var app=express();
app.use(methodOverride('_method'));
app.locals.moment = require('moment');
var currentCustId;
var query = {custId:''};
var Data =[]; 
var totalAmount = 0.0;
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/users/login');
}

router.get('/members',(req,res)=>{
    res.render('index', { title: 'Members' });
});

router.get('/userData',ensureAuthenticated,(req,res)=>{
    var Data =[]; 
    var totalAmount = 0.0;
        data.getDataById(currentCustId,(err,result)=>{
        console.log("current custId from get"+currentCustId);
        if(err) throw err;
        Data = result;
        console.log("Your Data is "+Data);
        for (var index in Data) {
            if (Data[index].typeOftransaction == "1") {
                totalAmount += Data[index].amount;
            } else {
                totalAmount -= Data[index].amount;
            }
        }
        for (var index in Data) {
            if (Data[index].typeOftransaction == "1") {
                Data[index].typeOftransaction = "Credit"
            } else {
                Data[index].typeOftransaction = "Debit"
            }
        }
        console.log("Total Amount is: " + totalAmount);
        res.render('userData',{title: 'Data', Data:Data, totalAmount:totalAmount });
    });
});
router.post('/userData/:id/delete',(req,res)=>{
    console.log("in router.delete: "+req.params.id);
    var dataToDelete = req.params.id;
    console.log("Deleting Data with id: "+ dataToDelete);
        data.deleteData(dataToDelete,(err,result)=>{
            if(err) throw err;
            console.log("Data Deleted!!!"+result);

         })
            var Data =[]; 
    var totalAmount = 0.0;
        data.getDataById(currentCustId,(err,result)=>{
        console.log("current custId from get"+currentCustId);
        if(err) throw err;
        Data = result;
        console.log("Your Data is "+Data);
        for (var index in Data) {
            if (Data[index].typeOftransaction == "1") {
                totalAmount += Data[index].amount;
            } else {
                totalAmount -= Data[index].amount;
            }
        }
        for (var index in Data) {
            if (Data[index].typeOftransaction == "1") {
                Data[index].typeOftransaction = "Credit"
            } else {
                Data[index].typeOftransaction = "Debit"
            }
        }
        console.log("Total Amount is: " + totalAmount);
        res.redirect('/users/userData');
        res.render('userData',{title: 'Data', Data:Data, totalAmount:totalAmount });
    });
});
router.get('/register', function(req, res, next) {
    res.render('register', { title: 'Register'});
});

router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Login' });
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/users/login', failureFlash: {message:"Invalid Credentials"} }), function(req, res, next) {
    req.flash('success', 'Login Successful');
    res.redirect('/');
});

passport.serializeUser(function(userObj, done) {
    console.log("In serializeUser "+userObj);
    done(null, userObj.id);
    
});
// console.log("Hiiii we are in userObj ......"+req.session.passport.userObj)
passport.deserializeUser(function(id, done) {
	currentCustId = id;
    query={custId:currentCustId};
    console.log(query);
    user.getUserById(id, function(err, userObj) {
        done(err, userObj);
    });
});
passport.use(new localStrategy((username, password, done) => {
    user.getUserByUsername(username, (err, userObj) => {
        if (err) throw err;
        if (!userObj) {
            return done(null, false, { message:'Unknown user' });
        }
        console.log(userObj);

        user.comparePasswords(password, userObj.password, (err, isMatch) => {
            console.log("Matching " + password);
            console.log("with " + userObj.password)
            if (err) return done(err);
            if (isMatch) {
                return done(null, userObj);
            } else {
                console.log("Invalid Password");
                return done(null, false, { message:'Invalid password' });
            }
        });

    });
}));
router.post('/register', upload.single('profileimage'), function(req, res, next) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    if (req.file) {
        console.log('uploading file...');
        var profileimage = req.body.filename;
    } else {
        console.log('No file found....');
        var profileimage = 'noimage.jpg';
    }

    req.checkBody('name', 'Name field required').notEmpty();
    req.checkBody('email', 'email field required').notEmpty();
    req.checkBody('email', 'email is invalid').isEmail();
    req.checkBody('username', 'username field required').notEmpty();
    req.checkBody('password', 'password field required').notEmpty();
    req.checkBody('password2', 'passwords do not match').equals(req.body.password);

    var error = req.validationErrors();

    if (error) {
        res.render('register', {
            errors: error
        });
    } else {
        var newUser = new user({
            name: name,
            email: email,
            username: username,
            password: password,
            profileimage: profileimage
        });
        user.createUser(newUser, (err, user) => {
            if (err) throw err;
            console.log(user);
        });
        req.flash('success', 'You are now registered!!! Proceed to login!')

        res.location('/');
        res.redirect('/');
    }


});

router.get('/logout',(req,res)=>{
	req.logout();
	req.flash('success', 'You have successfully logged out');
	res.redirect('/users/login');
});

router.post('/members', function(req, res, next) {
    console.log(req.body);
    var date = req.body.date;
    var description = req.body.description;
    var typeOftransaction = req.body.typeOftransaction;
    var amount = req.body.amount;

    console.log("name is:" + date);
    console.log("email is:" + description);
    console.log("tot is:" + typeOftransaction);
    console.log("password is:" + amount);
    var newData = new data({
            date: date,
            description: description,
            typeOftransaction: typeOftransaction,
            amount: amount,
            userId: currentCustId
        });
    console.log("The newly entered data is: "+newData);
        data.createData(newData, (err, data) => {
            if (err) throw err;
        });
        console.log("Your current data is: "+data.find({}));
        req.flash('success', 'Data Entered!!')

        res.location('/');
        res.redirect('/');
});

router.get('/members', (req,res)=>{
    var Data = {};
    data.getDataById(currentUserId,(err,res)=>{
        if(err) throw err;
        Data = res;
        console.log(Data);
        res.render('index',{
            dataForUser: Data
        });
    });
    
});
currentUserId = module.exports;
module.exports = router;