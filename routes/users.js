var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './uploads' });
var bodyParser = require('body-parser');
var user = require('../model/user');
var data = require('../model/data');
var shared = require('../model/shared');
var idAndName = require('../model/idAndName');
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var methodOverride = require('method-override');
var app=express();
var sharingId = 1;

app.use(methodOverride('_method'));
var currentCustId;
var uploaderName;
var query = {custId:''};
var Data =[]; 
var totalAmount = 0.0;
router.get('/', function(req, res, next) {
    res.render('respond with a resource');
});

function move() {
    console.log("in move function");
            router.get('/enterData',(req,res)=>{
            res.render('enterData', { title: 'Enter Data' });
            });
        }




function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/users/login');
}

function validateSharedType(req,res,next){
    if(req.acType != 'Shared'){
        console.log("from validateSharedType: "+req.acType);
        req.flash('error','This Account is Personal. Please proceed to personal login section');
        res.redirect('/users/loginShared');
    }
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
router.post('/userData/:id/delete', (req, res) => {
    console.log("in router.delete: " + req.params.id);
    var dataToDelete = req.params.id;
    console.log("Deleting Data with id: " + dataToDelete);
    data.deleteData(dataToDelete, (err, result) => {
        if (err) throw err;
        console.log("Data Deleted!!!" + result);

    })
    var Data = [];
    var totalAmount = 0.0;
    data.getDataById(currentCustId, (err, result) => {
        console.log("current custId from get" + currentCustId);
        if (err) throw err;
        Data = result;
        console.log("Your Data is " + Data);
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
        res.render('userData', { title: 'Data', Data: Data, totalAmount: totalAmount });
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
    uploaderName = userObj.username;
    console.log("In serializeUser "+uploaderName);
    done(null, userObj.id);   
});
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
        console.log("logging from passport.use: "+userObj);

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
    var acType = req.body.acType;
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
            acType: acType,
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
        req.flash('success', 'You are now registered!!!')
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

router.get('/indexShared',(req, res, next)=>{
    res.render('indexShared', { title: 'Shared Homepage' });
});

router.get('/loginShared', function(req, res, next) {
    res.render('loginShared', { title: 'Shared Login' });
});

router.post('/loginShared', passport.authenticate('local', { failureRedirect: '/users/loginShared', failureFlash: {message:"Invalid Credentials"} }), validateSharedType, function(req, res, next) {
    req.flash('success', 'Login Successful');
    res.redirect('/users/indexShared');
});
var shareUserDetails=[];
router.get('/shared',(req,res,next)=>{
    var users = [];
    user.getUserNames((err,result)=>{
        if (err) throw err;
        users = result;
        for(var index=0; index< users.length; index++){
            if(currentCustId == users[index]._id){
                users.splice(index,1);
            }
        }
        // for(var i in shareUserDetails){
        //     for(var j in users){
        //         if(shareUserDetails[i]._id == users[j]._id){
        //             users.splice(j,1);
        //         }
        //     }
        // }
        res.render('sharedPage',{title: 'Shared Section', users:users, shareUserDetails: shareUserDetails});
    });
    
});
router.post('/shared', (req, res, next) => {
    console.log("in post/shared");
    var sharerDetails = [];
    var shareWith = req.body.shareWith;
    var submit = req.body.submit;
    if (submit == 'Add') {
        user.getUserByUsername(shareWith, (err, userObj) => {
            if (err) throw err;
            shareUserDetails.push(userObj);
            console.log("shareUserDetails:  " + shareUserDetails);
            res.redirect('/users/shared');
        });
    }

    if (submit == 'Submit and Proceed') {
        var userId = [];
        for (var index in shareUserDetails) {
            userId.push(shareUserDetails[index]._id);
        }
        var newIdAndName = new idAndName({
            uploader: currentCustId,
            sharingWith: userId,
            accepted: false
        });
        idAndName.createData(newIdAndName, (err, data) => {
            if (err) throw err;
        });
        req.flash('success', 'Data Entered!!')
        res.redirect('/users/enterData');
    }
});

router.get('/enterData',(req,res)=>{
    res.render('enterData', { title: 'Enter Data' });
});

router.post('/enterData',(req,res,next)=>{
    var myId;
    var byWhomName;
    var date = req.body.date;
    var description = req.body.description;
    var typeOftransaction = req.body.typeOftransaction;
    var totalAmount = req.body.amount;
    var amount = totalAmount / (shareUserDetails.length + 1);
    console.log("Amount is: "+amount);
    for(var i in shareUserDetails){
        myId = shareUserDetails[i]._id;
        byWhomName = shareUserDetails[i].username
        console.log("myId is : " + myId);
        var newData = new shared({
            myId: myId,
            date: date,
            description: description,
            amount: amount,
            uploader: currentCustId,
            uploaderName: uploaderName,
            byWhomName: byWhomName,
            paid: false
        });
        console.log("new Data is: "+newData);
        shared.createData(newData,(err,data)=>{
            if(err) throw err;
        });
    }
    var description = req.body.description + ' (in Shared)';
    var newData = new data({
            date: date,
            description: description,
            typeOftransaction: typeOftransaction,
            amount: totalAmount,
            userId: currentCustId
        });
    console.log("The newly entered data is: "+newData);
    data.createData(newData, (err, data) => {
        if (err) throw err;
    });

    req.flash('success', 'Data Entered!!')
    res.redirect('/users/enterData');
});


router.get('/iOwe',(req,res,next)=>{
    var totalAmount = 0.0;
    var Data =[];
    shared.getDataForIOwe(currentCustId,(err,result)=>{
        if(err) throw err;
        Data = result;
        console.log("hiii.. from router.get iOwe: "+Data);
        for (var index in Data) {
            totalAmount += Data[index].amount;
        }

        res.render('iOwe',{title: 'iOwe', Data:Data, totalAmount:totalAmount });
    });
});

router.post('/iOwe/:id/pay', (req, res) => {
    var toPay = req.params.id;
    console.log("payingFrom: " + toPay);
    var Data = [];
    shared.getDataByIdForIOwe(toPay, (err, result) => {
        if (err) throw err;
        Data = result;
        console.log("Paid!!!" + Data);
        shared.updateData(toPay, (err, resp) => {
            if (err) throw err;
        })
        var date = new Date;
        var description = 'Paid for shared to ' + Data[0].uploaderName;
        var typeOftransaction = '2';
        var amount = Data[0].amount;
        console.log("amount from /iOwe/:id/pay : "+amount)
        var newData = new data({
            date: date,
            description: description,
            typeOftransaction: typeOftransaction,
            amount: amount,
            userId: currentCustId
        });
        data.createData(newData, (err, data) => {
            if (err) throw err;
        });

        var newData = new data({
            date: date,
            description: 'Received for shared payment from ' + Data[0].byWhomName,
            typeOftransaction: '1',
            amount: amount,
            userId: Data[0].uploader
        });
        data.createData(newData, (err, data) => {
            if (err) throw err;
        });
        res.redirect('/users/iOwe');
    });

});











router.get('/whoOwesMe',(req,res,next)=>{
    var totalAmount = 0.0;
    var Data =[];
    shared.getDataForwhoOweMe(currentCustId,(err,result)=>{
        if(err) throw err;
        Data = result;
        console.log("hiii.. from router.get whoOwesMe: "+Data);
        for (var index in Data) {
            totalAmount += Data[index].amount;
        }

        res.render('whoOwesMe',{title: 'whoOwesMe', Data:Data, totalAmount:totalAmount });
    });
});





currentUserId = module.exports;
module.exports = router;