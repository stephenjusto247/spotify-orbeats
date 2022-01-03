require('dotenv').config();
const axios = require('axios');
const updateAuthorizationDB = require('./updateAuthorizationDB');
const getRefreshToken = require('./getRefreshToken');

module.exports = async function refreshTokens() {
  const refreshToken = await getRefreshToken();
	const url = 'https://accounts.spotify.com/api/token';
	const data = new URLSearchParams({
		grant_type: 'refresh_token',
		refresh_token: refreshToken
	}).toString();
	const authOptions = {
    headers: {
      'Accept':'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    auth: {
      username: process.env.CLIENT_ID,
      password: process.env.CLIENT_SECRET
    }
	};

	// Use Axios to retrieve data using the constructed parameters
  try {
    const response = await axios.post(url, data, authOptions);
    newAccessToken = response.data.access_token;
    // Update DB to replace old token with fresh token
    await updateAuthorizationDB(newAccessToken, refreshToken);
  } catch(err) {
    console.log("Error occured when trying to refresh token! ");
		console.log(err.response);
  }
}