var connection = require('./connection');
var config = require('./config');

connection.connect(config.connectionString)
  .then(db => {

    var bodyParser = require('body-parser');
    var cookieParser = require('cookie-parser');
    var logger = require('morgan');


    var express = require('express');
    var app = express();
    var port = process.env.PORT || 8081;

    var periodsRouter = require('./app/routers/period-router');
    var workplansRouter = require('./app/routers/user-workplan-router');
    var cors = require('capital-auth').cors;

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(cors);
    app.use(function (request, response, next) {
      request.db = db;
      next();
    });

    app.use('/periods', periodsRouter);
    app.use('/workplans', workplansRouter);

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
          message: error.message || error
        }
      });
    });

    app.listen(port);
    console.log('listening port ' + port);

  });
