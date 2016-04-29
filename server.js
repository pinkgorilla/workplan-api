var connection = require('./connection');
var config = require('./config');

connection.connect(config.connectionString)
  .then(db => {

    var bodyParser = require('body-parser');
    var cookieParser = require('cookie-parser');
    var logger = require('morgan');


    var express = require('express');
    var app = express();

    var employees = require('./app/routers/employee-router');
    var periods = require('./app/routers/period-router');
    var employeeWorkplans = require('./app/routers/employee-workplan-router');
    var initialChecker = require('./app/middlewares/params/initial');
    var dbWrapper = require('./app/middlewares/dbwrapper');
    var cors = require('./app/middlewares/cors');

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(dbWrapper(db));
    app.use(cors);

    app.use('/employees', employees);
    app.use('/periods', periods);

    app.param('initial', initialChecker);
    app.use('/:initial/workplans', employeeWorkplans);

    app.use(function (request, response, next) {
      var apiVersion = response.locals.apiVersion;
      var data = response.locals.data;
      response.json({
        'apiVersion': apiVersion,
        'data': data
      });
    });

    app.use(function (error, request, response, next) {
      var apiVersion = response.locals.apiVersion;
      var data = response.locals.data;
      console.log(error);
      response.json({
        'apiVersion': apiVersion,
        'error': {
          message: error.message
        }
      });
    });

    app.listen(3000);
    console.log('listening port 3000');

  });
