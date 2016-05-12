'use strict'

var map = require('capital-models').map;
var ObjectId = require('mongodb').ObjectId;
var Manager = require('./manager');
var moment = require('moment');
var UserWorkplan = require('capital-models').workplan.UserWorkplan;
var UserWorkplanItem = require('capital-models').workplan.UserWorkplanItem;

module.exports = class UserWorkplanManager extends Manager {

    constructor(db) {
        super(db);
    }

    read(accountId) {
        return new Promise(function (resolve, reject) {
            var collection = this.db.collection(map.workplan.period);

            collection.find().toArray()
                .then(periods => {
                    var promises = [];
                    var _accountId = new ObjectId(accountId);
                    for (var period of periods) {
                        var asyncJob = new Promise(function (resolve, reject) {
                            var p = period;
                            var query = { accountId: _accountId, periodId: p._id }
                            this.dbSingleOrDefault(map.workplan.userWorkplan, query)
                                .then(uWorkplan => {
                                    if (uWorkplan) {
                                        resolve(uWorkplan);
                                    }
                                    else {
                                        var wp = new UserWorkplan({ accountId: _accountId, periodId: p._id, period: p });
                                        resolve(wp);
                                    }
                                })
                                .catch(e => reject(e));
                        }.bind(this));
                        promises.push(asyncJob);
                    }

                    Promise.all(promises)
                        .then(result => {
                            resolve(result);
                        })
                        .catch(e => reject(e));
                })
                .catch(e => reject(e));

        }.bind(this));
    }

    get(identity, month, period) {
        return new Promise(function (resolve, reject) {

            var initial = identity.initial;
            var _accountId = new ObjectId(identity._id);
            var query = { accountId: _accountId, 'period.month': month, 'period.period': period };

            this.dbSingleOrDefault(map.workplan.userWorkplan, query)
                .then(doc => {
                    if (doc == null) {
                        var periodQuery = { month: month, period: period };
                        this.dbSingle(map.workplan.period, periodQuery)
                            .then(period => {
                                var workplan = {
                                    accountId: _accountId,
                                    periodId: period._id,
                                    period: period,
                                    items: [],
                                    completion: 0
                                };

                                workplan = new UserWorkplan(workplan);
                                workplan.code = period.month + '0' + period.period + initial;
                                workplan.code = workplan.code.replace('-', '');
                                workplan.stamp(identity.username, '');

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
                var _periodId = new ObjectId(data.periodId);
                var _workplanId = new ObjectId(data._id);
                var periodQuery = { _id: _periodId };

                this.dbSingleOrDefault(map.workplan.period, periodQuery)
                    .then(period => {
                        if (!period)
                            reject("invalid period");
                        else {
                            var query = { accountId: _accountId, periodId: _periodId };
                            data.accountId = _accountId;
                            data.periodId = _periodId;
                            data.period = period;
                            data.code = period.month + '0' + period.period + initial;
                            data.code = data.code.replace('-', '');

                            var completedCount = 0;
                            var workplanItems = []
                            for (var item of data.items) {
                                var workplanItem = new UserWorkplanItem(item);
                                workplanItem.userWorkplanId = _workplanId;

                                workplanItem.no = data.items.indexOf(item) + 1;
                                workplanItem.code = data.code + (workplanItem.no < 10 ? ('0' + workplanItem.no) : workplanItem.no);
                                workplanItem.stamp(identity.username, '');
                                if (workplanItem.done === true)
                                    completedCount++;
                                workplanItems.push(workplanItem);
                            }
                            data.items = workplanItems;
                            if (data.items.length > 0)
                                data.completion = parseInt(completedCount * 100 / data.items.length);

                            this.dbUpdate(map.workplan.userWorkplan, query, data)
                                .then(doc => {
                                    resolve(doc);
                                })
                                .catch(e => reject(e));
                        }
                    })
                    .catch(e => reject(e));
            }
        }.bind(this));
    }
}