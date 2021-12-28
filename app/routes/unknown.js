const express = require('express');
const router = express.Router();

// If an unknown url is entered render the 404 page
router.get("/*", function(req, res) {
	res.render("error.ejs");
});

module.exports = router;