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
            data.stamp('actor', 'agent');
            data.from = moment(data.from).format("YYYY-MM-DD");
            data.to = moment(data.to).format("YYYY-MM-DD");

            this.validate(data)
                .then(validPeriod => {
                    this.dbInsert(map.workplan.period, data, { month: 1, period: 1 })
                        .then(result => {
                            resolve(result);
                        })
                        .catch(e => reject(e));
                })
                .catch(e => reject(e));
        }.bind(this));
    }

    update(period) {
        return new Promise(function (resolve, reject) {
            var data = new Period(period);
            data._id = new ObjectId(data._id);
            data.from = moment(data.from).format("YYYY-MM-DD");
            data.to = moment(data.to).format("YYYY-MM-DD");

            this.validate(data)
                .then(validPeriod => {
                    var query = { _id: validPeriod._id };

                    this.dbUpdate(map.workplan.period, query, validPeriod)
                        .then(doc => {
                            resolve(doc);
                        })
                        .catch(e => reject(e));
                })
                .catch(e => reject(e));
        }.bind(this));
    }

    validate(period) {
        return new Promise(function (resolve, reject) {
            var collection = this.db.collection(map.workplan.period);
            collection.find().toArray()
                .then(periods => {
                    for (var p of periods) {
                        if (p._id.toString() != (period._id || '').toString() && this._dateRangeOverlaps(p.from, p.to, period.from, period.to)) {
                            reject("date overlap with another period");
                            return;
                        }
                    }
                    resolve(period);
                })
                .catch(e => reject(e));
        }.bind(this));
    }

    _dateRangeOverlaps(a_start, a_end, b_start, b_end) {
        return (a_start <= b_end) && (a_end >= b_start);
        // if (a_start <= b_start && b_start <= a_end) return true; // b starts in a
        // if (a_start <= b_end && b_end <= a_end) return true; // b ends in a
        // if (b_start < a_start && a_end < b_end) return true; // a in b
        // return false;
    }
}