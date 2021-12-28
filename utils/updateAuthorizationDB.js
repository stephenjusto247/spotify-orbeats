const Authorization = require('../models/authorization');

// Check database and update new tokens
module.exports = async function updateAuthorizationDB(newAccessToken, newRefreshToken) {
	await Authorization.find({}).then(async (authorizations) => {
    // If no existing tokens are found in the DB then simply add the new tokens
		if (authorizations.length === 0) {
			await Authorization.create({
				access_token: newAccessToken,
				refresh_token: newRefreshToken
			});
		} else { // If existing tokens are found then update to new ones
			await Authorization.updateOne(authorizations[0],
			{access_token: newAccessToken, refresh_token: newRefreshToken});
		}
  }).catch((err) => {
    console.log("An error occured when trying to access the DB for tokens!");
    console.log(err);
  });
}