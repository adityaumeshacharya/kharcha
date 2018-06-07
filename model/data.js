var mongoose = require('mongoose');
const ObjectId = require('mongodb').ObjectID;

mongoose.connect('mongodb://localhost/nodeauth');

var db = mongoose.connection;


var dataSchema = mongoose.Schema({
	date:{
		type: Date
	},
	description:{
		type: String
	},
	typeOftransaction:{
		type: String
	},
	amount:{
		type: Number
	},
	userId:{
		type: String
	}
});

var data = module.exports = mongoose.model('data',dataSchema);

module.exports.createData=(newData,callback)=>{
	newData.save(callback);
}

module.exports.getDataById=(id,callback)=>{
	var query = {userId: id};
	data.find(query, (callback)).sort({"date":1});
}


module.exports.deleteData=(id,callback)=>{
	console.log("in deleteData function and deleting id: "+id);
	data.remove({ '_id': ObjectId(id) },(callback));
}
