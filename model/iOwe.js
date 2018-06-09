var mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;


mongoose.connect('mongodb://adi:1aditya@ds151530.mlab.com:51530/nodeauth');

var db = mongoose.connection;


var sharedSchema = mongoose.Schema({
	myId:{
		type: String
	},
	date:{
		type: Date
	},
	description:{
		type: String
	},
	amount:{
		type: Number
	},
	uploader:{
		type: String
	}
});

var shared = module.exports = mongoose.model('shared',sharedSchema);

module.exports.createData=(newData,callback)=>{
	console.log("Hiii.. from createData!!!"+newData);
	newData.save(callback);
}