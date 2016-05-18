var express = require('express');
var router = express.Router();  

var PeriodService = require('../services/period-service');
var service = new PeriodService();

var jwt = require('mean-toolkit').passport.jwt; 

// Middlewares.
router.use(service.version.bind(service)); 

router.all('*', jwt.authenticate({ session: false }));
// Routes.
router.get('/', service.all.bind(service));
router.get('/:month/:period', service.get.bind(service));
router.post('/', service.create.bind(service));
router.put('/:month/:period', service.update.bind(service));
router.delete('/:month/:period', service.delete.bind(service));

module.exports = router;
