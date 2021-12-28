const express = require('express');
const router = express.Router();

const ApiError = require('../utils/error/ApiError');
const apiErrorHandler = require('../utils/error/apiErrorHandler');
const { searchForArtistById, searchForRelatedArtists } = require('../utils/searchForArtist');
const updateSearchDB = require('../utils/updateSearchDB');

// Search for related artists in Spotify's DB and
// render the results in the related page
router.get('/:id', async function(req, res, next){
  try {
    const target = await searchForArtistById(req.params.id);
    if (target instanceof ApiError) return next(target);
    // Update DB with newest search
    await updateSearchDB(target);
    const data = await searchForRelatedArtists(req.params.id);
    // render the related page with the contents of relatedArtists
    if (data) {
      if (data instanceof ApiError) return next(data);
      const relatedArtists = [];
      data.forEach(function(artist){
        relatedArtists.push(artist);
      });
      return res.render("related.ejs", {artist: target, relatedArtists: relatedArtists});
    } 
    res.render("related.ejs", {artist: target, relatedArtists: null});
  } catch(err) {
    if (err.response) {
      if (err.response.status === 400){
        res.render("related.ejs", {artist: null, relatedArtists: null});
      }
      else if (err.response.status === 503){
        res.redirect("/related/" + req.params.id);
      }
      else{
        next(new ApiError(err.response.status, 'Something went wrong when searching for related artists'));
      }
    } else next(ApiError.internal('Something went wrong when searching for related artists'));
  }
});

router.use(apiErrorHandler);

module.exports = router;