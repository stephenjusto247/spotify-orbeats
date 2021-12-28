const mongoose = require('mongoose');
const { Schema } = mongoose;

const SearchSchema = new Schema({
	id: {
    type: String,
    required: true
  },
	name: {
    type: String,
    required: true
  },
  img: String
});

const Search = mongoose.model('Search', SearchSchema);
module.exports = Search;