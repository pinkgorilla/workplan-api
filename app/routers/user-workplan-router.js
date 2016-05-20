var express = require('express');
var router = express.Router();

var UserWorkplanService = require('../services/user-workplan-service');
var service = new UserWorkplanService();

var jwt = require('mean-toolkit').passport.jwt;

// Middlewares.
router.use(service.version.bind(service));
// router.param('initial', service.initialCheck.bind(service));
router.param('month', service.monthCheck.bind(service));
router.param('period', service.periodCheck.bind(service));

router.all('*', jwt.authenticate({ session: false }));
// Routes.
router.get('/', service.all.bind(service));
router.get('/:month/:period', service.get.bind(service));
router.put('/:month/:period', service.update.bind(service));
router.get('/current', service.current.bind(service))

router.post('/:month/:period/items/', service.createItem.bind(service))
router.put('/:month/:period/items/:code', service.updateItem.bind(service))
// router.put('/:month/:period', service.update.bind(service));
// router.delete('/:month/:period', service.delete.bind(service));

module.exports = router;