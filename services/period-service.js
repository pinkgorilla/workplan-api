'use strict'
var Service = require('./service');
var Period = require('../models/period');

module.exports = class PeriodService extends Service {
  constructor() {
    super("1.0.0");
    this.collectionName = "periods";
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
    var month = request.params.month;
    var period = request.params.period;
    var query = { month: month, period: period };

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
    var month = data.month;
    var period = data.period;
    var query = { month: month, period: period };

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