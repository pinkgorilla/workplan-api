'use strict'
var Service = require('mean-toolkit').Service;
var moment = require('moment');
var models = require('capital-models');
var Period = models.workplan.Period;
var map = models.map;
var config = require('../../config');
var PeriodManager = require('../managers/period-manager');

module.exports = class PeriodService extends Service {
  constructor() {
    super("1.0.0");
    this.collectionName = map.workplan.period;
  }

  all(request, response, next) {
    this.connectDb(config.connectionString)
      .then(db => {

        var periodManager = new PeriodManager(db);
        periodManager.read()
          .then(docs => {
            response.locals.data = docs;
            next();
          })
          .catch(e => next(e));
      })
      .catch(e => next(e));
  }

  get(request, response, next) {

    this.connectDb(config.connectionString)
      .then(db => {

        var month = request.params.month;
        var period = request.params.period;
        var periodManager = new PeriodManager(db);

        periodManager.get(month, period)
          .then(doc => {
            response.locals.data = doc;
            next();
          })
          .catch(e => next(e));
      })
      .catch(e => next(e));
  }

  create(request, response, next) {

    this.connectDb(config.connectionString)
      .then(db => {

        var body = request.body;
        var periodManager = new PeriodManager(db);

        periodManager.create(body)
          .then(doc => {
            response.locals.data = doc;
            next();
          })
          .catch(e => next(e));
      })
      .catch(e => next(e));
  }

  update(request, response, next) {
    this.connectDb(config.connectionString)
      .then(db => {
        var body = request.body;
        var periodManager = new PeriodManager(db);

        periodManager.update(body)
          .then(doc => {
            response.locals.data = doc;
            next();
          })
          .catch(e => next(e));
      })
      .catch(e => next(e));
  }

  delete(request, response, next) {
    console.log('delete:called');
    response.send('');
  }
}