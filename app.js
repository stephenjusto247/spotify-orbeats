const express = require('express'); // Express web server framework
const mongoose = require("mongoose");
const axios = require("axios");
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const ejs = require('ejs');

const clientId = "CLIENT_ID";
const clientSecret = "CLIENT_SECRET";
const redirectUri = "REDIRECT_URI";

let accessToken = "";
let refreshToken = "";

// Stores the most recent searches
// Prevents us from having to access
// the DB every time the homepage refreshes
let recentSearches = [];

// Number of most recent search histories
// to display in the homepage
const numToDisplay = 4;
const app = express();

mongoose.connect("mongodb://localhost:27017/tokens", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
	Authorization.find({}, (err, authorizations)=>{
		if (err){
			console.log("An error occured when accessing the DB for tokens! ");
			console.log(err);
		}
		else if (authorizations.length === 0){
			console.log("No authorization tokens found!");
		}
		else{
			accessToken = authorizations[0].access_token;
			refreshToken = authorizations[0].refresh_token;
			refreshTokens((err)=>{
				if (err) {
					console.log("An error occured when trying to refresh the tokens!")
					console.log(err.repsonse.status);
					res.render("error.ejs");
				}
			});
		}
	});
	Searches.find({}, (err, searches)=>{
		if (err){
			console.log("An error occured when accessing the DB for search histories! ");
		}
		else{
			recentSearches = searches;
		}
	});
})
.catch(error => console.log(error.message));

const authorizationSchema = new mongoose.Schema({
	access_token: String,
	refresh_token: String
});

const searchSchema = new mongoose.Schema({
	id: String,
	name: String,
	img: String
});

const Authorization = mongoose.model("Authorization", authorizationSchema);
const Searches = mongoose.model("Search", searchSchema);
//---------------------Helper functions below---------------------------------
function updateAuthorizationDB(newAccessToken, newRefreshToken){
	// Check database and update new tokens
	Authorization.find({}, (err, authorizations)=>{
		if (err){
			console.log("An error occured when trying to access the DB for tokens!");
			console.log(err);
		}
		// If no existing tokens are found in the DB
		// then simply add the new tokens
		else if (authorizations.length === 0){
			Authorization.create({
				access_token: newAccessToken,
				refresh_token: newRefreshToken
			}, (err, authorization)=>{
				if (err){
					console.log("Unable to save to the DB! ERROR occured...");
					console.log(err.response.status);
				}
				else{
					console.log("Successfully ADDED NEW authorization tokens!");
					console.log(authorization);
				}
			});
		}
		// If existing tokens are found then update to new ones
		else{
			Authorization.updateOne(authorizations[0],
			{access_token: newAccessToken, refresh_token: newRefreshToken},
			(err, res)=>{
				if (err) throw err;
				console.log("Successfully UPDATED the authorization tokens!");
				console.log(res);
			});
		}
	});
}

function updateSearchDB(target){
	Searches.find({}, (err, searches)=>{
		if (err) {
			console.log("An error occured when trying to access the DB for searches!");
			console.log(err);
		}
		else if (searches.length >= numToDisplay){
			// If the search in our DB is SUCCESSFUL AND
			// the DB is FULL then look for the OLDEST
			// search history and remove it and add target
			// as a new search history to our DB
			Searches.findOne({}, {}, { sort: {'created_at' : 1}}, (err, search)=>{
				if (err){
					console.log("Unable to find the oldest search history from the DB!");
					console.log(err);
				}
				else{
					// Prevents the same artist from being added
					// to the search history DB more than once
					let duplicate = false;
					for (let i = 0; i < recentSearches.length; i++){
						if (recentSearches[i].id === target.id){
							duplicate=true;
						}
					}
					if (!duplicate){
						// Remove the oldest search history in the recentSearches array
						// and remove the oldest history in the DB
						recentSearches.shift();
						Searches.deleteOne(search,(err, search)=>{
							if (err){
								console.log("Unable to remove oldest search history from the DB!")
								console.log(err);
							}
							else{
								// Add the newest search history in the DB
								Searches.create({
									id: target.id,
									name: target.name,
									img: target.images.length !== 0 ? target.images[0].url : null
								},(err, search)=>{
									if (err){
										console.log("Unable to add the most recent search history from the DB!");
										console.log(err);
									}
									else{
										console.log("Successfully added the most recent search to the DB!");
										recentSearches.push(search);
									}
								});
							}
						});
					}
				}
			})
		}
		else{
			// If the search in our DB is successful
			// then add target as a new search history 
			// to our DB

			// In case DB suddenly gets wiped 
			// clear recentSearches array to reset
			// search history in homepage (index.ejs)
			if (searches.length === 0){
				recentSearches = [];
			}
			// Prevents the same artist from being added
			// to the search history DB more than once
			let duplicate = false;
			for (let i = 0; i < recentSearches.length; i++){
				if (recentSearches[i].id === target.id){
					duplicate=true;
				}
			}
			if (!duplicate){
				Searches.create({
					id: target.id,
					name: target.name,
					img: target.images.length !== 0 ? target.images[0].url : null
				},(err, search)=>{
					if (err){
						console.log("Unable to add the most recent search history from the DB!");
						console.log(err);
					}
					else{
						console.log("Successfully added the most recent search to the DB!");
						recentSearches.push(search);
					}
				});
			}
		}
	});
}

// Refreshes the acess token
function refreshTokens(callback){
	// Set up parameters: url, data, authOptions
	const url = 'https://accounts.spotify.com/api/token';
	const data = {
		grant_type: 'refresh_token',
		refresh_token: refreshToken
	};
	const authOptions = {
        headers: {
          'Accept':'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        auth: {
          username: clientId,
          password: clientSecret
        }
	};
	// Use Axios to retrieve data using the constructed parameters
	axios.post(url, querystring.stringify(data), authOptions)
	.then((response)=>{
		// New access token
		accessToken = response.data.access_token;
		// Update DB to replace old token with fresh token
		updateAuthorizationDB(accessToken, refreshToken);
		callback(null);
	})
	.catch((error)=>{
		console.log("Error occured when trying to refresh token! ");
		console.log(error);
		console.log(error.response.status + ": from refreshTokens");
		callback(error);
	});
}

// Accesses the Spotify API and searches for an artist by name
// Returns a list of artists 
function searchForArtistByName(name, callback){
	// Construct the url
	let url = "https://api.spotify.com/v1/search?access_token=" +
		accessToken + "&token_type=Bearer&q=" + name + "&type=artist";
	// Use Axios to retrieve data from the constructed url
	axios.get(url)
	.then((response) => {
		// Return the list of artists if successful
		callback(response.data.artists.items, null);
	})
	.catch((error) => {
		// Return the error
		console.log("ERROR WHEN LOOKING FOR ARTISTS BY NAME: ");
		callback(null, error);
	});
}

// Accesses the Spotify API and searches for an artist by id
// Returns the specific artist
function searchForArtistById(id, callback){
	// Construct the url
	let url = "https://api.spotify.com/v1/artists/"+id+"/?access_token=" +
		accessToken + "&token_type=Bearer";
	// Use Axios to retrieve data from the constructed url
	axios.get(url)
	.then((response) => {
		// Return the artist if successful
		callback(response.data, null);
	})
	.catch((error) => {
		console.log("ERROR WHEN LOOKING FOR ARTISTS BY ID: ");
		callback(null, error);
	});
}

// Accesses the Spotify API and searches for artists related
// to the artist with the given id
// Returns a list of artists
function searchForRelatedArtists(id, callback){
	// Construct the url
	let url = "https://api.spotify.com/v1/artists/" + id + "/related-artists?access_token="+
		accessToken + "&token_type=Bearer";
	// Use axios to retrieve data from the constructed url
	axios.get(url)
	.then((response) => {
		// Return the list of artists if successful
		callback(response.data.artists, null);
	})
	.catch((error) => {
		console.log("ERROR WHEN LOOKING FOR RELATED ARTISTS: ");
		callback(null, error);
	});
}

//---------------------Express Stuff Below---------------------------------
app.use(express.static(__dirname + '/public'))
.use(cors())
.use(cookieParser())
.use(bodyParser.urlencoded({extended: true}));

// Homepage
app.get("/", function(req, res){
	// Render homepage and most recent searches from DB
	if (accessToken === "") res.redirect("/resetauthorizationtokens");
	else res.render("index.ejs", {searches: recentSearches});
});

app.post("/", function(req, res){
	res.redirect("/search/" + req.body.name);
});

app.get('/resetauthorizationtokens', function(req, res) {
	// Application requests authorization
	// Then redirects to "/callback"
	let scope = 'user-read-private user-read-email';
	res.redirect('https://accounts.spotify.com/authorize?' +
	querystring.stringify({
		response_type: 'code',
		client_id: clientId,
		scope: scope,
		redirect_uri: redirectUri
	}));
});

app.get('/requestnewauthorizationtokens', function(req, res) {
	// Application requests refresh and access tokens
	// after checking the state parameter
	const code = req.query.code || null;
	// Set up parameters: url, authOptions, and data
	const url = "https://accounts.spotify.com/api/token";
	const authOptions = {
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/x-www-form-urlencoded"
		},
		auth: {
			username: clientId,
			password: clientSecret
		}
	}
	const data = {
		code: code,
		redirect_uri: redirectUri,
		grant_type: "authorization_code"
	}

	// Use Axios to retrieve tokens from the constructed parameters
	axios.post(url, querystring.stringify(data), authOptions)
	.then((response)=>{
		// Initialize new tokens
		accessToken = response.data.access_token;
		refreshToken = response.data.refresh_token;
		//Update DB
		updateAuthorizationDB(accessToken, refreshToken);
		
		res.redirect("/");
	})
	.catch((error)=>{
		res.render("error.ejs");
	});
});

// Search for artists in Spotify's DB and
// render the results in the search page
app.get("/search/:name", function(req, res){
	if (req.params.name !== ""){
		searchForArtistByName(req.params.name, function(data, err){	
			if (!err){
				// If the search for the artist is successful,
				// then put the results in an array called artistList
				// and render the search page with the contents of
				// artistList
				let artistList = [];
				if (data !== null)
				{
					data.forEach(function(artist){
						artistList.push(artist);
					});
				}
				res.render("search.ejs", {artists: artistList});
			}
			else{
				// Handle errors here
				// 401 = No authorization
				if (err.response.status === 401){
					// Access token may have expired! So we'll try refreshing
					refreshTokens((err)=>{
						if (err){
							// If refreshing tokens fails
							// then perhaps we are missing 
							// a refresh token..?
							res.redirect("/resetauthorizationtokens");
						}
						else{
							// If refreshing tokens is successful
							// then search for the artist again
							res.redirect("/search/" + req.params.name);
						}
					});
				}
				// 400 = Bad Request, 
				else if (err.response.status === 400){
					console.log(err.response.status);
					res.render("search.ejs", {artists: null});
				}
				// 503 = Spotify API Temporarily Unavailable
				else if (err.response.status === 503){
					console.log(err.response.status);
					res.redirect("/search/" + req.params.name);
				}
				else{
					console.log(err.response.status);
					res.render("error.ejs");
				}
			}
		});
	}
	else{
		res.render("search.ejs", {artists: null});
	}
});

// Search for related artists in Spotify's DB and
// render the results in the related page
app.get("/related/:id", function(req, res){
	searchForArtistById(req.params.id, (target, err)=>{
		if (!err){
			// If the search for the specific artist is SUCCESSFUL, then
			// check our DB to decide whether to add "target" to
			// our DB
			updateSearchDB(target);
			// Search for artists related to "target"
			searchForRelatedArtists(req.params.id, function(data, err){
				if (!err){
					// If the search for related artists is SUCCESSFUL, then
					// put the results in an array called relatedArtists
					// and render the related page with the contents of
					// relatedArtists
					if (data !== null){
						let relatedArtists = [];
						data.forEach(function(artist){
							relatedArtists.push(artist);
						});
						res.render("related.ejs", {artist: target, relatedArtists: relatedArtists});
					}
					else{
						res.render("related.ejs", {artist: target, relatedArtists: null});
					}
				}
				else{
					// Handle errors here
					if (err.response.status === 401){
						// Access token may have expired!
						refreshTokens((err)=>{
							if (err){
								res.redirect("/resetauthorizationtokens");
							}
							else{
								res.redirect("/related/" + req.params.id);
							}
						});
					}
					else if (err.response.status === 400){
						console.log(err.response.status);
						res.render("related.ejs", {artist: null, relatedArtists: null});
					}
					else if (err.response.status === 503){
						console.log(err.response.status);
						res.redirect("/related/" + req.params.id);
					}
					else{
						console.log(err.response.status);
						res.render("error.ejs");
					}
				}
			});
		}
		else{
			// Handle errors here
			if (err.response.status === 401){
				// Access token may have expired!
				refreshTokens((err)=>{
					if (err){
						res.redirect("/resetauthorizationtokens");
					}
					else{
						res.redirect("/related/" + req.params.id);
					}
				});
			}
			else if (err.response.status === 400){
				console.log(err.response.status);
				res.render("related.ejs", {artist: null, relatedArtists: null});
			}
			else if (err.response.status === 503){
				console.log(err.response.status);
				res.redirect("/related/" + req.params.id);
			}
			else{
				console.log(err.response.status);
				res.render("error.ejs");
			}
		}
	})
});

// If an unknown url is entered
// render the error page
app.get("/*", function(req,res){
	res.render("error.ejs");
});

//Start App
app.listen(process.env.PORT || 8888, ()=>{
	//Initialize authorization tokens from DB!!
	console.log("Server started!")
});