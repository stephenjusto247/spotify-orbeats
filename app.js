// package imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const logger = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

// project imports
const refreshTokens = require('./utils/refreshTokens');
const apiErrorHandler = require('./utils/error/apiErrorHandler');
const indexRouter = require('./routes/index');
const searchRouter = require('./routes/search');
const relatedRouter = require('./routes/related');
const unknownRouter = require('./routes/unknown');

const app = express();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tokens', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('connected to db')
	await refreshTokens();
})
.catch(error => console.log(error.message));

// middlewares
app.use(express.static(__dirname + '/public'))
.use(logger('dev'))
.use(cors())
.use(cookieParser())
.use(bodyParser.urlencoded({extended: true}));

// routers
app.use(indexRouter)
.use('/search', searchRouter)
.use('/related', relatedRouter)
.use(apiErrorHandler)
.use(unknownRouter);

app.listen(process.env.PORT || 3000, ()=>{
	console.log(`Server listening on ${process.env.PORT || 3000}`);
});