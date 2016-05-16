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

    get(user, month, period) {
        return new Promise(function (resolve, reject) {

            var initial = user.initial;
            var _accountId = new ObjectId(user.id);
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
                                workplan.stamp(user.username, '');

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

    update(user, workplan) {

        return new Promise(function (resolve, reject) {
            var data = new UserWorkplan(workplan);
            var initial = user.initial;
            if (!initial) {
                reject("identity.initial cannot be empty");
            }
            else {
                data._id = new ObjectId(data._id);
                data.accountId = new ObjectId(data.accountId);
                data.periodId = new ObjectId(data.periodId);

                this.validate(data)
                    .then(validWorkplan => {
                        var periodQuery = { _id: validWorkplan.periodId };
                        this.dbSingleOrDefault(map.workplan.period, periodQuery)
                            .then(period => {
                                var query = { accountId: validWorkplan.accountId, periodId: validWorkplan.periodId };
                                validWorkplan.period = period;
                                validWorkplan.code = period.month + '0' + period.period + initial;
                                validWorkplan.code = validWorkplan.code.replace('-', '');

                                var completedCount = 0;
                                var workplanItems = []
                                for (var item of validWorkplan.items) {
                                    var workplanItem = new UserWorkplanItem(item);
                                    workplanItem.userWorkplanId = validWorkplan._id;

                                    workplanItem.no = validWorkplan.items.indexOf(item) + 1;
                                    workplanItem.code = validWorkplan.code + (workplanItem.no < 10 ? ('0' + workplanItem.no) : workplanItem.no);
                                    workplanItem.stamp(user.username, '');
                                    if (workplanItem.done === true)
                                        completedCount++;
                                    workplanItems.push(workplanItem);
                                }
                                validWorkplan.items = workplanItems;
                                if (validWorkplan.items.length > 0)
                                    validWorkplan.completion = (completedCount * 100 / validWorkplan.items.length).toFixed(2);

                                this.dbUpdate(map.workplan.userWorkplan, query, validWorkplan)
                                    .then(doc => {
                                        resolve(doc);
                                    })
                                    .catch(e => reject(e));
                            })

                    })
                    .catch(e => reject(e));
            }
        }.bind(this));
    }

    validate(userWorkplan) {
        return new Promise(function (resolve, reject) {

            var accountId = new ObjectId(userWorkplan.accountId);
            var periodId = new ObjectId(userWorkplan.periodId);

            var periodQuery = { _id: periodId };

            this.dbSingleOrDefault(map.workplan.period, periodQuery)
                .then(period => {
                    if (!period)
                        reject("invalid period");
                    else {
                        for (var item of userWorkplan.items) {
                            if (!item.type || item.type.length < 1) {
                                reject("workplan contains invalid item: type");
                                return;
                            }
                            if (!item.name || item.name.length < 1) {
                                reject("workplan contains invalid item: name");
                                return;
                            }
                        }
                        resolve(userWorkplan);
                    }
                })
                .catch(e => reject(e));
        }.bind(this));
    }
}