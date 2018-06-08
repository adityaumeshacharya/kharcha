var express = require('express');
var router = express.Router();
var data = require('../model/data');
var user = require('../routes/users');
// var app=express();
// var moment = require('moment');
// var date = "Wed Jun 06 2018 05:30:00 GMT+0530 (IST)	";
// var date = moment(date).format("MMM Do YY");
// // Date.parse(todaysDate).toString("dd/mm/yyyy");

// console.log("Date from index.js: "+date)

/* GET home page. */

router.get('/', ensureAuthenticated,function(req, res, next) {
  res.render('index', { title: 'Members'});
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect('/users/login');
}

module.exports = router;
