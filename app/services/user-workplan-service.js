'use strict'
var Service = require('mean-toolkit').Service;
var models = require('capital-models');
var UserWorkplan = models.workplan.UserWorkplan;
var map = models.map;
var ObjectId = require('mongodb').ObjectId;
var config = require('../../config');
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
        this.connectDb(config.connectionString)
            .then(db => {
                var userWorkplanManager = new UserWorkplanManager(db);
                var user = request.user;
                userWorkplanManager.read(user.id)
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
                var user = request.user;
                var month = request.params.month;
                var period = request.params.period;
                var userWorkplanManager = new UserWorkplanManager(db);

                userWorkplanManager.get(user, month, period)
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
                var user = request.user;
                var body = request.body;

                var userWorkplanManager = new UserWorkplanManager(db);

                userWorkplanManager.update(user, body)
                    .then(doc => {
                        response.locals.data = doc;
                        next();
                    })
                    .catch(e => next(e));
            })
            .catch(e => next(e));
    }
}