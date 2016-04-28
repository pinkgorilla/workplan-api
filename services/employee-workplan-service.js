'use strict'
var Service = require('./service');
var EmployeeWorkplan = require('../models/employee-workplan');

module.exports = class EmployeeWorkplanService extends Service {

    constructor() {
        super("1.0.0");
        this.collectionName = "employee-workplans";
    } 

    monthCheck(request, response, next, id) {
        next();
    }

    periodCheck(request, response, next, id) {
        next();
    }

    all(request, response, next) {
        var collection = request.db.collection('periods');
        collection.find().toArray()
            .then(docs => {
                response.locals.data = docs;
                next();
            })
            .catch(e => next(error));
    }

    get(request, response, next) {
        var collection = request.db.collection(this.collectionName);
        var initial = request.params.initial;
        var month = request.params.month;
        var period = request.params.period;

        var query = { initial: initial, month: month, period: period };
        request.single('employees', { initial: initial })
            .then(employee => {
                if (employee == null)
                    next(new Error("employee not found"))
                else {
                    request.single(this.collectionName, query)
                        .then(doc => {
                            if (doc == null) {
                                var periodQuery = { month: month, period: period };
                                request.single('periods', periodQuery)
                                    .then(period => {
                                        if (period == null) {
                                            next(new Error("period not found"));
                                        }
                                        else {
                                            // var employee = response.locals.employee;
                                            var workplan = {
                                                employeeId: employee._id,
                                                initial: initial,
                                                periodId: period._id,
                                                month: period.month,
                                                period: period.period,
                                                from: period.from,
                                                to: period.to,
                                                items: [],
                                                completionPercentage: 0
                                            };
                                            workplan = new EmployeeWorkplan(workplan);
                                            workplan.stamp('', '');
                                            request.db.collection(this.collectionName).insertOne(workplan)
                                                .then(result => {
                                                    if (result.insertedCount < 1)
                                                        next(new Error("failed to insert workplan"));
                                                    else {
                                                        workplan._id = result.insertedId;
                                                        response.locals.data = workplan;
                                                        next();
                                                    }
                                                })
                                                .catch(e => next(e));
                                        }
                                    })
                                    .catch(e => next(e));
                            }
                            else {
                                response.locals.data = doc;
                                next();
                            }
                        })
                        .catch(e => next(e));
                }
            })
            .catch(e => next(e));
    }

    update(request, response, next) {
        var data = new EmployeeWorkplan(request.body);
        var initial = request.params.initial;
        var month = request.params.month;
        var period = request.params.period;

        var query = { initial: initial, month: month, period: period };

        for (var item of data.items) {
            if (item.no == 0) {
                item.no = data.items.indexOf(item) + 1;
                item.code = month + '0' + period + initial + (item.no < 10 ? ('0' + item.no) : item.no);
                item.code = item.code.replace('-','');
            }
        }

        request.update(this.collectionName, query, data)
            .then(doc => {
                response.locals.data = doc;
                next();
            })
            .catch(e => next(e));
    }
}