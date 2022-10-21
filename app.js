const express = require('express');
const mongoose = require('mongoose');
const dotenv  = require('dotenv');

const errorCtrl = require('./controller/errorCtrl');

const user = require('./routes/user');

const app = express();

dotenv.config();

app.use(express.json());

app.use('/user',user);

app.use("*", (req, res, next) => {
  const error = new Error("Not found");
  error.statusCode = 404;
  next(error);
});

app.use(errorCtrl);

mongoose.connect(process.env.MONGODB_LOCAL).then(() => console.log('DB connected..')).catch(err => console.log(err));

app.listen(process.env.PORT,()=>console.log(`App Running at port ${process.env.PORT}`));
