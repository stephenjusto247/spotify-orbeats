const Search = require('../models/search');
const NUMTODISPLAY = 4

module.exports = async function updateSearchDB(target){
  try {
    const searches = await Search.find({}).exec();
    // Prevents the same artist from being added to the search history DB more than once
    let duplicate = false;
    for (let i = 0; i < searches.length; i++){
      if (searches[i].id === target.id){
        duplicate=true;
      }
    }
    if (!duplicate) {
      if (searches.length >= NUMTODISPLAY){
        // Look for the OLDEST search history and remove it
        const search = await Search.findOne({}, {}, { sort: {'created_at' : 1}}).exec();
        await Search.deleteOne(search).exec();
      }
      // Add target as a new search history to the DB
      await Search.create({
        id: target.id,
        name: target.name,
        img: target.images ? target.images[0].url : null
      });
    }
  } catch (err) {
    console.log('An error occured when trying to update the search collections!');
    console.log(err);
  }
}