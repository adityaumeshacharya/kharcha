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
	},
	uploaderName:{
		type: String
	},
	byWhomName:{
		type: String
	},
	paid:{
		type: Boolean
	}
});

var shared = module.exports = mongoose.model('shared',sharedSchema);

module.exports.createData=(newData,callback)=>{
	console.log("Hiii.. from createData!!!"+newData);
	newData.save(callback);
}
module.exports.getDataForIOwe=(id,callback)=>{
	console.log("hiii from getDataForIOwe: "+id);
	var query = {
		myId: id,
		paid: false
	};
	shared.find(query,(callback));
}
module.exports.getDataForwhoOweMe=(id,callback)=>{
	console.log("hiii from getDataForwhoOweMe: "+id);
	var query = {
		uploader: id,
		paid: false
	};
	shared.find(query,(callback));
}


module.exports.getDataByIdForIOwe=(id,callback)=>{
	console.log("hiii from getDataByIdForIOwe: "+id);
	var query = {
		_id: id,
		paid: false
	};
	shared.find(query,(callback));
}


module.exports.updateData=(id,callback)=>{
	var query = {_id: id};
	var newvalue = { $set: {paid: true} };
	shared.updateOne(query,newvalue,(callback));
}