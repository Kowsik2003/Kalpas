const router = require('express').Router();

const userCtrl = require('../controller/userCtrl');

router.route('/register')
	.post(userCtrl.register)

router.route('/login')
	.post(userCtrl.login)

router.route('/checklogin')
	.get(userCtrl.protect,userCtrl.success);

router.route('/sendotp')
		.post(userCtrl.sendOtp);

router.route('/verifyotp')
		.post(userCtrl.verifyOtp);

module.exports = router;