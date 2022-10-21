class AppError {
	constructor(message,code)
	{
		this.statusCode = code;
		this.message = message;
	}
}

module.exports = AppError;