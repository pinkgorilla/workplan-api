var express = require('express');
var app = express();

var toolkit = require('mean-toolkit');
app.use(toolkit.middlewares.enableCors);

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
 
var passport = require('passport');
app.use(passport.initialize());

var config = require('./config');
var jwt = require('mean-toolkit').passport.jwt;
jwt.strategy(function (payload, done) {
    return done(null, payload);
}, config.secret);

var morgan = require('morgan');
app.use(morgan('dev'));

var periodsRouter = require('./app/routers/period-router');
app.use('/periods', periodsRouter);

var workplansRouter = require('./app/routers/user-workplan-router');
app.use('/workplans', workplansRouter);

app.use(toolkit.middlewares.resultFormatter);
app.use(toolkit.middlewares.errorFormatter);

var port = process.env.PORT || 8081;
app.listen(port);
console.log('listening port ' + port);

