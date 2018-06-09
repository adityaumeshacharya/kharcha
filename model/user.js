var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');


mongoose.connect('mongodb://adi:1aditya@ds151530.mlab.com:51530/nodeauth');

var db = mongoose.connection;

var userSchema = mongoose.Schema({
	username:{
		type: String,
		index: true
	},
	password:{
		type: String
	},
	email:{
		type: String
	},
	name:{
		type: String
	},
	profileimage:{
		type:String
	}
});

var user = module.exports = mongoose.model('user',userSchema);

module.exports.getUserById = (id,callback)=>{
	user.findById(id, callback);
}

module.exports.getUserByUsername = (username, callback)=>{
	console.log("in getUserByUsername");
	var query = {username: username};
	user.findOne(query, (callback));
}

module.exports.comparePasswords = (candidatePassword,hash,callback)=>{
	console.log("in comparePasswords");
	bcrypt.compare(candidatePassword, hash, (err,isMatch)=>{
		callback(err, isMatch);
	});
}

module.exports.createUser = (newUser,callback)=>{
	bcrypt.genSalt(10,(err,salt)=>{
		bcrypt.hash(newUser.password,salt,(err,hash)=>{
			newUser.password = hash;
			newUser.save(callback);

		});
	});
}

module.exports.getUserNames = (callback)=>{
	user.find({},(callback)).sort({"username":1});
	
}