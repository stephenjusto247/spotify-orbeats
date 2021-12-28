const express = require('express');
const axios = require('axios');
const router = express.Router();

const ApiError = require('../utils/error/ApiError');
const updateAuthorizationDB = require ('../utils/updateAuthorizationDB');

router.get('/resetauthorizationtokens', function(req, res) {
	// Application requests authorization then redirects to "/callback"
	const scope = 'user-read-private user-read-email';
  const params = new URLSearchParams({
    response_type: 'code',
		client_id: process.env.CLIENT_ID,
		scope: scope,
		redirect_uri: process.env.REDIRECT_URI || 'http://localhost:3000/requestnewauthorizationtokens'
  })
	res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

router.get('/requestnewauthorizationtokens', async function(req, res, next) {
	// Application requests refresh and access tokens after checking the state parameter
	const code = req.query.code || null;
	const url = "https://accounts.spotify.com/api/token";
	const authOptions = {
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/x-www-form-urlencoded"
		},
		auth: {
			username: process.env.CLIENT_ID,
			password: process.env.CLIENT_SECRET
		}
	}
	const data = new URLSearchParams({
		code: code,
		redirect_uri: process.env.REDIRECT_URI || 'http://localhost:3000/requestnewauthorizationtokens',
		grant_type: "authorization_code"
	}).toString();

  try {
    // Use Axios to retrieve tokens from the constructed parameters
    const response = await axios.post(url, data, authOptions);
    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;
    await updateAuthorizationDB(accessToken, refreshToken);
    res.redirect("/");
  } catch (err) {
    if (err.response) {
      console.log(err.response);
      next(new ApiError(err.response.status, 'Something went wrong'));
    } else {
      console.log(err);
      next(ApiError.internal('Unknown error occured'));
    }
  }
});

module.exports = router;