const Authorization = require('../models/authorization');

module.exports = async function getRefreshToken() {
  return await Authorization.find({}).limit(1).exec().then((authorizations) => {
    return authorizations.length > 0 ? authorizations[0].refresh_token : undefined;
  }).catch((err) => {
    console.log('An error occured when getting refresh token!');
    console.log(err);
  });
}