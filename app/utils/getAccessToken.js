const Authorization = require('../models/authorization');

module.exports = async function getAccessToken() {
  return await Authorization.find({}).limit(1).exec().then((authorizations) => {
    return authorizations.length > 0 ? authorizations[0].access_token : undefined;
  }).catch((err) => {
    console.log('An error occured when getting access token!');
    console.log(err);
  });
}