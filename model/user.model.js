const mongoose = require('mongoose');
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
	user : {
		type : String,
		required : [true,'userName is required']
	},
	password : {
		type : String,
		select : false,
				required : [true,'password is required']
	},
	phone : {
		type : Number,
		unique : true
	},
	isVerified : {
		type : Boolean,
		default : false 
	},
	otp : {
		type : Number
	}
});

userSchema.pre('save', async function(next) {
		if(this.test)
			return next()

	this.password = await bcrypt.hash(this.password,10);
	next();
});

userSchema.methods.checkPassword = async function(givenPassword,userPassword) {
	return await bcrypt.compare(givenPassword,userPassword);
}

module.exports = mongoose.model('user',userSchema)
