'use strict'

var map = require('capital-models').map;
var ObjectId = require('mongodb').ObjectId;
var Manager = require('mean-toolkit').Manager;
var moment = require('moment');
var Period = require('capital-models').workplan.Period;

module.exports = class PeriodManager extends Manager {

    constructor(db, user) {
        super(db);
        this.user = user;
        this.periodCollection = this.db.collection(map.workplan.period);
    }

    read() {
        return new Promise((resolve, reject) => {
            this.periodCollection.find().toArray()
                .then(docs => {
                    resolve(docs);
                })
                .catch(e => reject(e));
        });
    }

    getById(periodId) {
        return new Promise((resolve, reject) => {
            var query = { _id: new ObjectId(periodId) };
            this.get(query)
                .then(period => resolve(period))
                .catch(e => reject(e));
        });
    }

    getByMonthAndPeriod(month, period) {
        return new Promise((resolve, reject) => {
            var query = { month: month, period: period };
            this.get(query)
                .then(period => resolve(period))
                .catch(e => reject(e));
        });
    }

    get(query) {
        return new Promise((resolve, reject) => {
            this.periodCollection.dbSingle(query)
                .then(doc => {
                    resolve(doc);
                })
                .catch(e => reject(e));
        })
    }

    create(period) {
        return new Promise((resolve, reject) => {
            var data = new Period(period);
            data.stamp('actor', 'agent');
            data.from = moment(data.from).format("YYYY-MM-DD");
            data.to = moment(data.to).format("YYYY-MM-DD");

            this._validate(data)
                .then(validPeriod => {
                    this._ensureIndexes()
                        .then(indexResults => {
                            validPeriod.stamp(this.user.username, 'agent');
                            this.periodCollection.dbInsert(data)
                                .then(result => {
                                    resolve(result);
                                })
                                .catch(e => {
                                    reject(e);
                                });
                        })
                        .catch(e => {
                            reject(e);
                        });
                })
                .catch(e => {
                    reject(e);
                });
        });
    }

    update(period) {
        return new Promise((resolve, reject) => {
            var data = new Period(period);
            data._id = new ObjectId(period._id);
            data.from = moment(data.from).format("YYYY-MM-DD");
            data.to = moment(data.to).format("YYYY-MM-DD");

            var query = { _id: data._id };

            this.periodCollection.dbSingle(query)
                .then(dbPeriod => {
                    if (dbPeriod._stamp && dbPeriod._stamp.toString().length > 0 && dbPeriod._stamp != date._stamp)
                        reject("stamp mismatch");
                    else {
                        var p = new Period(Object.assign({}, dbPeriod, data))
                        this._validate(p)
                            .then(validPeriod => {
                                validPeriod.stamp(this.user.username, 'agent')
                                this.periodCollection.dbUpdate(query, validPeriod)
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

    _validate(period) {
        var vPeriod = new Period(period);
        return new Promise((resolve, reject) => {
            this.periodCollection.find().toArray()
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
        });
    }

    _dateRangeOverlaps(a_start, a_end, b_start, b_end) {
        return (a_start <= b_end) && (a_end >= b_start);
    }

    _ensureIndexes() {
        return new Promise((resolve, reject) => {
            // account indexes
            var periodsPromise = this.periodCollection.createIndexes([
                {
                    key: { month: 1, period: 1 },
                    name: "ix_periods_month_period",
                    unique: true
                }]);

            Promise.all([periodsPromise])
                .then(results => resolve(results))
                .catch(e => {
                    reject(e);
                });
        })
    }
}