const User = require('../model/user.model');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');


const AppError = require('../utils/AppError')

const signToken = (id) => {
		const token = jwt.sign({id : id},process.env.JWT_KEY);

		return token;
}

exports.register = async (req,res,next) => {
	try {
		if(!req.body.userName || !req.body.password)
			return next(new AppError('provide userName and password',400));
		if(!req.body.phone)
			return next(new AppError('provide phone',400))

		const userName =  req.body.userName;
		const password = req.body.password;
		const phone = req.body.phone;

		// console.log(userName)

		const ckUser = await User.findOne({user : userName});

		// console.log(ckUser)

		if(ckUser)
			return next(new AppError('userName exist already',400));

		const user = await User.create({
			user : userName,
			password : password,
			phone : phone
		});

		res.status(200).json({
			status : 'success',
			message : 'user registered please verify phone and login'
		});
	} catch(err) {
		next(err)
	}
}

exports.login = async (req,res,next) =>{
	try {
		if(!req.body.userName || !req.body.password)
			return next(new AppError('provide userName and password'));

		const ckUser = await User.findOne({user : req.body.userName}).select('password isVerified');

		if(!ckUser)
			return next(new AppError('userName not found',404));
		console.log(ckUser)
		if(!ckUser.isVerified)
			return next(new AppError('user is not verified',401))

		if(!(await ckUser.checkPassword(req.body.password,ckUser.password)))
			return next(new AppError('incorrect password',400));

		const token  = signToken(ckUser._id);

		res.status(200).json({
			status : 'success',
			jwt : token
		});
	} catch(err) {
		next(err)
	}
}

exports.sendOtp = async (req,res,next) => {
	try {
		const phone = req.body.phone;

		const user = await User.findOne({phone : phone});

		if(!user)
			return next(new AppError('user with this phone not found',404));

		if(user.isVerified)
			return next(new AppError('user registered already',400));

		const accountSid = process.env.TWILIO_ACCOUNT_SID;
		const authToken = process.env.TWILIO_AUTH_TOKEN;
		const client = require('twilio')(accountSid, authToken);

		const otp = Math.floor(100000 + Math.random() * 900000);

		// await client.messages
		//   .create({
		//      body: `OTP is ${otp}`,
		//      from: '+15017122661',
		//      to: `+91${phone}`
		//    })
		//   .then(message => console.log(message.sid));

		user.otp = otp;
		user.test = true
		await user.save();  

		res.status(200).json({
			status : 'success',
			message : 'otp is send ',
			otp
		})  

	} catch(err) {
		console.log(err)
		next(err)
	}
}

exports.verifyOtp = async (req,res,next) => {
	try {
		if(!req.body.phone)
			return next(new AppError('provide phone number',400));

		if(!req.body.otp)
			return next(new AppError('provide otp',400));

		const user = await User.findOne({phone : req.body.phone});

		if(!user)
			return next(new AppError('phone number not found'))

		if(!(user.otp == req.body.otp))
			return next(new AppError('wrong otp',401));

		user.otp = null;
		user.isVerified = true;
		user.test = true

		await user.save();
			console.log(user)
		res.status(200).json({
			status : 'success',
			message : 'user is verified successfully'
		})
	} catch(err) {
		next(err)
	} 
}

exports.success = (req,res,next) => {
	try {
		res.status(200).json({
			status : "success",
			message : "you are login successfully"
		})
	} catch(err) {
		next(err);
	}
}

exports.protect = async (req,res,next) => {
	try {
		const token = req.headers.authorization;

		if(!token)
			return next(new AppError('user not logged In',403));

		const jwtId = await promisify(jwt.verify)(token,process.env.JWT_KEY);

		const jwtUser = await User.findById(jwtId.id);

		if(!jwtUser)
			return next(new AppError('The user does not exist !',404));

		req.user = jwtUser;
		next();
	} catch (err) {
		return next(err);
}
}
