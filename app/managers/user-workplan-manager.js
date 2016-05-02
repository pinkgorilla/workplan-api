'use strict'

var map = require('capital-models').map;
var ObjectId = require('mongodb').ObjectId;
var Manager = require('./manager');
var moment = require('moment');
var UserWorkplan = require('capital-models').workplan.UserWorkplan;

module.exports = class UserWorkplanManager extends Manager {

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

    get(accountId, month, period) {
        return new Promise(function (resolve, reject) {
            var _accountId = new ObjectId(accountId);
            var query = { accountId: _accountId, month: month, period: period };

            this.dbSingleOrDefault(map.workplan.userWorkplan, query)
                .then(doc => {
                    if (doc == null) {
                        var periodQuery = { month: month, period: period };
                        this.dbSingle(map.workplan.period, periodQuery)
                            .then(period => {
                                var workplan = {
                                    accountId: _accountId,
                                    periodId: period._id,
                                    month: period.month,
                                    period: period.period,
                                    from: period.from,
                                    to: period.to,
                                    items: [],
                                    completion: 0
                                };
                                workplan = new UserWorkplan(workplan);
                                workplan.stamp('', '');
                                this.dbInsert(map.workplan.userWorkplan, workplan, { accountId: 1, periodId: 1 })
                                    .then(result => {
                                        workplan._id = result.insertedId;
                                        resolve(workplan)
                                    })
                                    .catch(e => reject(e));
                            })
                            .catch(e => reject(e));
                    }
                    else {
                        resolve(doc);
                    }
                })
                .catch(e => reject(e));

        }.bind(this));
    }

    update(identity, workplan) {

        return new Promise(function (resolve, reject) {
            var data = new UserWorkplan(workplan);
            var initial = identity.initial;
            if (!initial) {
                reject("identity.initial cannot be empty");
            }
            else {
                var _accountId = new ObjectId(identity._id);
                var query = { accountId: _accountId, month: data.month, period: data.period };

                for (var item of data.items) {
                    if (item.no == 0) {
                        item.no = data.items.indexOf(item) + 1;
                        item.code = data.month + '0' + data.period + initial + (item.no < 10 ? ('0' + item.no) : item.no);
                        item.code = item.code.replace('-', '');
                    }
                }
                data.accountId = _accountId;
                this.dbUpdate(map.workplan.userWorkplan, query, data)
                    .then(doc => {
                        resolve(doc);
                    })
                    .catch(e => reject(e));
            }
        }.bind(this));
    }
}