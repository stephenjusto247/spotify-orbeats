const mongoose = require('mongoose');
const { Schema } = mongoose;

const AuthorizationSchema = new Schema({
	access_token: {
    type: String,
    required: true
  },
	refresh_token: {
    type: String,
    required: true
  }
});

const Authorization = mongoose.model('Authorization', AuthorizationSchema);
module.exports = Authorization;