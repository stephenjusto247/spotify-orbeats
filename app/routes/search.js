const express = require('express');
const router = express.Router();

const ApiError = require('../utils/error/ApiError');
const apiErrorHandler = require('../utils/error/apiErrorHandler');
const { searchForArtistByName } = require('../utils/searchForArtist');

// Search for artists in Spotify's DB and render the results in the search page
router.get('/:name', async function(req, res, next){
	const data = await searchForArtistByName(req.params.name);
  const artistList = [];

  if (data) {
    if (data instanceof ApiError) return next(data);
    data.forEach(function(artist){
      artistList.push(artist);
    });
  }

  res.render("search.ejs", {artists: artistList});
});

router.use(apiErrorHandler);

module.exports = router;