var mongodb = require('./db');
var async = require('async');
var util =require('util');
function Post(post){
	this.name=post.name;
	this.title=post.title;
	this.tags=post.tags;
	this.post=post.post;
}
module.exports = Post;
Post.prototype.save = function(callback){
	 var date = new Date();
	 var time = {

	      date: date,
	      year : date.getFullYear(),
	      month : date.getFullYear() + "-" + (date.getMonth() + 1),
	      day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
	      minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
	      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
	  	}
   	var post= {
		name :this.name,
		title:this.title,
		time : time,
		tags :this.tags,
		post :this.post
	}
	async.waterfall(
		[
		function(callback){
			mongodb.open(function(err,db) {
				callback(err,db);
			});
		},
		function(db,callback){
			db.collection('posts',function(err,collection){
				callback(err,collection);
			});
		},
		function(collection,callback){
			collection.insert(post,{
				safe:true
			},function(err,user){
				callback(err,post);
			});
		}],function(err,post) {
			mongodb.close();
			callback(err,post[0])
		});
};
Post.getTen = function(name, page, callback) {
  //打开数据库
  async.waterfall([
  	function(callback){
  		mongodb.open(function (err, db){
  			callback(err,db);
  		});
  	},
  	function(db,callback){
	db.collection('posts', function (err, collection) {
		callback(err,collection);
	});
  	},
  	function(collection,callback){
	 	  var query = {};
	      if (name) {
	        query.name = name;
	      }
	      collection.count(query, function (err, total) {
	      	
	      	collection.count(query, function (err, total) {
	      		collection.find(query, {
          			skip: (page - 1)*10,
          			limit: 10
        			}).sort({
          			time: -1
        			}).toArray(function(err,docs){
        			callback(err,docs,total);
        			});
	      	});

	      });
  	}
  	],function(err,docs,total){
  		mongodb.close();
  		callback(null, docs, total);
	});
}
Post.getOne = function(name, day, title, callback) {
    
    async.waterfall([
    function(callback) {
        mongodb.open(function(err, db) {
          
            callback(err, db);
        });
    },
    function(db, callback) {
        db.collection('posts',
        function(err, collection) {
          
            callback(err, collection);
        })
    },
    function(collection, callback) {
        collection.findOne({
            "name": name,
            "time.day": day,
            "title": title
        },
        function(err, doc) {
          callback(err,doc);
            
        });
      }],
    function(err, doc) {
      console.log('doc:'+doc);
        
        mongodb.close();
        callback(null, doc);

    });
}
Post.edit = function(name, day, title, callback) {
  async.waterfall(
  	[
  	function(callback){
  		mongodb.open(function(err,db){
  			callback(err,db);
  		});
  	},
  	function(db,callback){
  		mongodb.collection('posts', function (err, collection) {
  			callback(err,collection);
  		});
  	},
  	function(collection,callback){
		collection.findOne({
		        "name": name,
		        "time.day": day,
		        "title": title
		      }, function (err, doc) {
           callback(err,doc);
		      });
  	}
  	],function(err,doc){
      callback(null, doc);
  	});
}
Post.update = function(name, day, title, post, callback) {
  async.waterfall([
  	function(callback){
  		mongodb.open(function(err,db){
  			callback(err,db);
  		});
  	},
  	function(db,callback){
 	mongodb.collection('posts', function (err, collection) {
	collection.update({
	        "name": name,
	        "time.day": day,
	        "title": title
	      }, {
	        $set: {post: post}
	      }, function (err) {
	      	callback(err);
	      });
 	});
 	}],function(err){
  		callback(null);
  	})
 }
Post.remove = function(name, day, title, callback) {
  async.waterfall([
  	function(callback){
  		mongodb.open(function(err,db){
  			callback(err,db);
  		});
  	},
  	function(db,callback){
  		 db.collection('posts', function (err, collection) {
      callback(err,collection);
  		});
  	},
  	function(collection,callback){
		collection.findOne({
		        "name": name,
		        "time.day": day,
		        "title": title
		      }, function (err, doc) {
		      	collection.remove({
		          "name": name,
		          "time.day": day,
		          "title": title
		        }, {
		          w: 1
		        }, function (err) {
              callback(err);
		          });
		      });
  	}
  	],function(err){
      callback(null);
  	});
}
Post.getTags = function(callback) {
  async.waterfall([
    function(callback){
    mongodb.open(function(err,db){
      callback(err,db);
    })
  },
  function(db,callback){
    mongodb.collection('posts', function (err, collection) {
      callback(err,collection);
    });
  },function(collection,callback){
    //distinct 用来找出给定键的所有不同值
    collection.distinct("tags", function (err, docs) {
      callback(err,docs);
    });
  }
  ],function(err,docs){
    mongodb.close();
    callback(null, docs);
  });
};
Post.getTag = function( tags, callback) {
  //打开数据库
  async.waterfall([
    function(callback){
      mongodb.open(function (err, db){
        callback(err,db);
      });
    },
    function(db,callback){
  db.collection('posts', function (err, collection) {
    callback(err,collection);
  });
    },
    function(collection,callback){
      console.log('tags'+tags);
      collection.find({
        "tags": tags
      }, {
        "name": 1,
        "time": 1,
        "title": 1
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        console.log(docs);
        callback(err,docs);
      });
    }
    ],function(err,docs){
      mongodb.close();
      callback(null ,docs);
  });
}
//返回通过标题关键字查询的所有文章信息
Post.search = function(keyword, callback) {
    console.log('keyword:'+keyword);
    async.waterfall([
      function(callback){
      mongodb.open(function (err, db){
        callback(err,db);
      });
    },
      function(db,callback){
        db.collection('posts', function (err, collection) {
          callback(err,collection);
        });
      },
      function(collection,callback){
        var pattern = new RegExp(keyword, "i");
        console.log('pattern:'+pattern);
      collection.find({
        "title": pattern
      }, {
        "name": 1,
        "time": 1,
        "title": 1
      }).sort({
        time: -1
      }).toArray(function (err, docs) {
        callback(err,docs);
      });
      }
      ],
      function(err,docs){
        mongodb.close();
        callback(null, docs);
      });
};
  
   
      

          

      
    
     
    
