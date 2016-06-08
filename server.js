var factory = require('mongo-factory');
var config = require('./config');

factory.getConnection(config.connectionString)
    .then(db => {
        var express = require('express');
        var app = express();

        var bodyParser = require('body-parser');
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());

        var toolkit = require('mean-toolkit');
        app.use(toolkit.middlewares.enableCors);

        var passport = require('passport');
        app.use(passport.initialize());

        var morgan = require('morgan');
        app.use(morgan('dev'));

        var controllerOptions = { jwt: { secret: config.secret } };
        var PeriodController = require('workplan-mod').controllers.PeriodController;
        app.use('/periods', new PeriodController(db, controllerOptions).router);

        var WorkplanController = require('workplan-mod').controllers.UserWorkplanController;
        app.use('/workplans', new WorkplanController(db, controllerOptions).router);


        var port = process.env.PORT || 8081;
        app.listen(port);
        console.log('listening port ' + port);

    })
    .catch(e => {
        console.log(e);
    })

