var Service = require('../services/employee-workplan-service');
var express = require('express');
var router = express.Router({mergeParams: true});
var service = new Service();

// Middlewares.
router.use(service.version.bind(service));
// router.param('initial', service.initialCheck.bind(service));
router.param('month', service.monthCheck.bind(service));
router.param('period', service.periodCheck.bind(service));


// Routes.
router.get('/', service.all.bind(service));
router.get('/:month/:period', service.get.bind(service));
router.put('/:month/:period', service.update.bind(service));
// router.put('/:month/:period', service.update.bind(service));
// router.delete('/:month/:period', service.delete.bind(service));

module.exports = router;