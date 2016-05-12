'use strict'
var Service = require('./service');
var moment = require('moment');
var models = require('capital-models');
var Period = models.workplan.Period;
var map = models.map;
var PeriodManager = require('../managers/period-manager');

module.exports = class PeriodService extends Service {
  constructor() {
    super("1.0.0");
    this.collectionName = map.workplan.period;
  }

  all(request, response, next) {

    var periodManager = new PeriodManager(request.db);
    periodManager.read()
      .then(docs => {
        response.locals.data = docs;
        next();
      })
      .catch(e => next(e));
  }

  get(request, response, next) {
    var month = request.params.month;
    var period = request.params.period;
    var periodManager = new PeriodManager(request.db);

    periodManager.get(month, period)
      .then(doc => {
        response.locals.data = doc;
        next();
      })
      .catch(e => next(e));
  }

  create(request, response, next) {
    var body = request.body;

    var periodManager = new PeriodManager(request.db);

    periodManager.create(body)
      .then(doc => {
        response.locals.data = doc;
        next();
      })
      .catch(e => next(e));
  }

  update(request, response, next) {
    var body = request.body;
    var periodManager = new PeriodManager(request.db);

    periodManager.update(body)
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