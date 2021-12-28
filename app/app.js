require('dotenv').config();
const express = require('express'); // Express web server framework
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");

const refreshTokens = require('./utils/refreshTokens');
const indexRouter = require('./routes/index');
const searchRouter = require('./routes/search');
const relatedRouter = require('./routes/related');
const unknownRouter = require('./routes/unknown');

const app = express();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
	await refreshTokens;
})
.catch(error => console.log(error.message));

// middlewares
app.use(express.static(__dirname + '/public'))
.use(cors())
.use(cookieParser())
.use(bodyParser.urlencoded({extended: true}));

// routers
app.use(indexRouter)
.use('/search', searchRouter)
.use('/related', relatedRouter)
.use(unknownRouter);

app.listen(process.env.PORT || 3000, ()=>{
	console.log(`Server listening on ${process.env.PORT || 3000}`);
});