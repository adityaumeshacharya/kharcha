var express = require('express');
var router = express.Router();
var data = require('../model/data');
var user = require('../routes/users');
var app=express();
var moment = require('moment');
var date = require('datejs');
var todaysDate = new Date();
// Date.parse(todaysDate).toString("dd/mm/yyyy");
var date=todaysDate.getDate();

/* GET home page. */
console.log("From index.js "+user.currentCustId);
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
