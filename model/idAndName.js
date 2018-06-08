var mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;


mongoose.connect('mongodb://adi:1aditya@ds151530.mlab.com:51530/nodeauth');

var db = mongoose.connection;


var idAndName = mongoose.Schema({
	uploader:{
		type: String
	},
	sharingWith:{
		type: String
	}
});

var idToName = module.exports = mongoose.model('idToName',idAndName);

module.exports.createData=(newData,callback)=>{
	newData.save(callback);
}