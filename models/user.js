var mongodb = require('./db');
var async = require('async');
function User(user){
	this.name=user.name;
	this.password=user.password;
}
module.exports = User;
User.prototype.save = function(callback){
	var user= {
		name :this.name,
		password:this.password
	}
	async.waterfall(
		[
		function(callback){
			mongodb.open(function(err,db) {
				callback(err,db);
			});
		},
		function(db,callback){
			db.collection('users',function(err,collection){
				callback(err,collection);
			});
		},
		function(collection,callback){
			collection.insert(user,{
				safe:true
			},function(err,user){
				callback(err,user);
			});
		}],function(err,user) {
			mongodb.close();
			
			callback(err,user)
		});
};
User.get = function(name,callback) {
	async.waterfall([
		function(callback){
			mongodb.open(function (err,db) {
				callback(err,db);
			})
		},
		function(db,callback){
			db.collection('users',function (err,collection){
			 	callback(err,collection);
			})
		},
		function(collection,callback) {
			collection.findOne({
				name :name
			}, function(err,user) {
				callback( err,user);
			})
		}
		],function( err, user){
			mongodb.close();
			callback( err,user);
		});
};
