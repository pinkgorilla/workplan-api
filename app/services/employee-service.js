'use strict'
var Service = require('./service');
var Employee = require('../models/employee');


module.exports = class collectionervice extends Service {
  constructor() {
    super("1.0.0");
    this.collectionName = "employees";
  }  
  
  all(request, response, next) {
    var collection = request.db.collection(this.collectionName);
    collection.find().toArray()
      .then(docs => {
        response.locals.data = docs;
        next();
      })
      .catch(e => next(error));
  }

  get(request, response, next) {
    var collection = request.db.collection(this.collectionName);
    var initial = request.params.initial;
    var query = { initial: initial };

    request.single(this.collectionName, query)
      .then(doc => {
        response.locals.data = doc;
        next();
      })
      .catch(e => next(e));
  }

  create(request, response, next) {
    var body = request.body;
    var data = Object.assign(new Employee(), body);
    var collection = request.db.collection(this.collectionName);
    data.dob = data.dob ? new Date(data.dob) : new Date();
    data.stamp('actor', 'agent');

    collection.insertOne(data)
      .then(result => {
        response.locals.data = result;
        next();
      })
      .catch(e => next(e))
  }

  update(request, response, next) {
    var data = request.body;
    var collection = request.db.collection(this.collectionName);
    var query = { 'initial': data.initial };
    request.update(this.collectionName, query, data)
      .then(doc => {
        response.locals.data = doc;
        next();
      })
      .catch(e => next(e));
  }

  delete(request, response, next) {
    console.log('delete:called');
    response.send('');
  }
}

