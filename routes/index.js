const express = require('express');
const router = express.Router();

const getSearches = require('../utils/getSearches');

// Homepage
router.get("/", async function(req, res){
  res.render("index.ejs", {searches: await getSearches()});
});

router.post('/', function(req, res) {
  res.redirect("/search/" + req.body.name);
})

module.exports = router;