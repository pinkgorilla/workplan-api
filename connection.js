exports.connect = function(connectionString) {

  var mongodb = require('mongodb');
  var mongoClient = mongodb.MongoClient;

  return new Promise(function(resolve, reject) {
    mongoClient.connect(connectionString, function(error, db) {
      if (error)
        reject(error);

      resolve(db);
    });
  });
}
