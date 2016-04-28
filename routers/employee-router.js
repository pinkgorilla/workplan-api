var Service = require('../services/employee-service');
var initialChecker = require('../middlewares/params/initial');
var express = require('express');
var router = express.Router();
var service = new Service();

// Middlewares.
router.param('initial', initialChecker);
router.use(service.version.bind(service));

// Routes.
router.get('/', service.all.bind(service));
router.get('/:initial', service.get.bind(service));
router.post('/', service.create.bind(service));
router.put('/:initial', service.update.bind(service));
router.delete('/:initial', service.delete.bind(service));

module.exports = router;