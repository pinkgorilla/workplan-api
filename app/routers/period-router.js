var Service = require('../services/period-service');
var express = require('express');
var router = express.Router();
var service = new Service();

// Middlewares.
router.use(service.version.bind(service));
// router.param('initial', service.initialCheck.bind(service));

// Routes.
router.get('/', service.all.bind(service));
router.get('/:month/:period', service.get.bind(service));
router.post('/', service.create.bind(service));
router.put('/:month/:period', service.update.bind(service));
router.delete('/:month/:period', service.delete.bind(service));

module.exports = router;
