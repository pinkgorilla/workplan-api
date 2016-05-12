'use strict'
var Service = require('./service');
var models = require('capital-models');
var UserWorkplan = models.workplan.UserWorkplan;
var map = models.map;
var ObjectId = require('mongodb').ObjectId;
var UserWorkplanManager = require('../managers/user-workplan-manager');

module.exports = class UserWorkplanService extends Service {

    constructor() {
        super("1.0.0");
        this.collectionName = map.workplan.userWorkplan;
    }

    monthCheck(request, response, next, id) {
        next();
    }

    periodCheck(request, response, next, id) {
        next();
    }

    all(request, response, next) {
        var userWorkplanManager = new UserWorkplanManager(request.db);
        var identity = request.identity;
        userWorkplanManager.read(identity._id)
            .then(docs => {
                response.locals.data = docs;
                next();
            })
            .catch(e => next(e));
    }

    get(request, response, next) {
        var identity = request.identity;
        var month = request.params.month;
        var period = request.params.period;
        var userWorkplanManager = new UserWorkplanManager(request.db);

        userWorkplanManager.get(identity, month, period)
            .then(doc => {
                response.locals.data = doc;
                next();
            })
            .catch(e => next(e));
    }

    update(request, response, next) {
        var body = request.body;
        var identity = request.identity;

        var userWorkplanManager = new UserWorkplanManager(request.db);

        userWorkplanManager.update(identity, body)
            .then(doc => {
                response.locals.data = doc;
                next();
            })
            .catch(e => next(e));
    }
}