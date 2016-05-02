'use strict'

var map = require('capital-models').map;
var ObjectId = require('mongodb').ObjectId;
var Manager = require('./manager');
var moment = require('moment'); 
var Period = require('capital-models').workplan.Period;

module.exports = class PeriodManager extends Manager {

    constructor(db) {
        super(db);
    }

    read() {
        return new Promise(function (resolve, reject) {
            var collection = this.db.collection(map.workplan.period);
            collection.find().toArray()
                .then(docs => {
                    resolve(docs);
                })
                .catch(e => reject(e));
        }.bind(this));
    }

    get(month, period) {
        return new Promise(function (resolve, reject) {
            var query = { month: month, period: period };
            this.dbSingle(map.workplan.period, query)
                .then(doc => {
                    resolve(doc);
                })
                .catch(e => reject(e));
        }.bind(this));
    }

    create(period) {
        return new Promise(function (resolve, reject) {
            var data = new Period(period);
            var collection = this.db.collection(map.workplan.period);
            data.stamp('actor', 'agent');
            data.from = moment(data.from).format("YYYY-MM-DD");
            data.to = moment(data.to).format("YYYY-MM-DD");
            this.dbInsert(map.workplan.period, data, { month: 1, period: 1 })
                .then(result => {
                    resolve(result);
                })
                .catch(e => reject(e));
        }.bind(this));
    }

    update(period) {

        return new Promise(function (resolve, reject) {

            var month = period.month;
            var _period = period.period;
            var query = { month: month, period: _period };

            var data = new Period(period);
            data.from = moment(data.from).format("YYYY-MM-DD");
            data.to = moment(data.to).format("YYYY-MM-DD");

            this.dbUpdate(map.workplan.period, query, data)
                .then(doc => {
                    resolve(doc);
                })
                .catch(e => reject(e));
        }.bind(this));
    }
}