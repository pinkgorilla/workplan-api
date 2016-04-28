module.exports = function (db) {
    var dbwrapper = function (request, response, next) {
        var r = request;
        r.db = db;
        
        // get single data;
        r.single = function (collectionName, query) {
            return r.db.collection(collectionName).find(query).limit(1).next();
        };
        
        // update single data
        r.update = function (collectionName, query, updateObject) {

            return new Promise(function (resolve, reject) {

                r.single(collectionName, query)
                    .then(doc => {
                        if (doc._stamp != updateObject._stamp)
                            reject('stamp mismatch');
                        else {
                            var Base = require('./models/base');

                            if (updateObject instanceof Base) {
                                console.log('base');
                                updateObject.stamp('', '');
                            }

                            var collection = r.db.collection(collectionName);
                            delete updateObject._id;
                            collection.updateOne(query, { $set: updateObject })
                                .then(result => {
                                    r.single(collectionName, query)
                                        .then(doc => {
                                            resolve(doc);
                                        })
                                        .catch(e => reject(e));
                                })
                                .catch(e => reject(e));
                        }
                    })
                    .catch(e => reject(e));
            });
        }
        next();
    }
    return dbwrapper;
}