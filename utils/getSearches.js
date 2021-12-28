const Search = require('../models/search');

module.exports = async function getSearches() {
  return await Search.find({}).exec().catch((err) => {
    console.log('An error occured when searching the Search collection!');
    console.log(err);
  });
}