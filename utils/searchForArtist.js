const axios = require('axios');

const ApiError = require('./error/ApiError');
const refreshTokens = require('./refreshTokens');
const getAccessToken = require('./getAccessToken');

async function handleError(err) {
  if (err.response) {
    console.error(err.response.data);
    if (err.response.status === 401) {
      await refreshTokens();
      return ApiError.unauthorized('Unauthorized access to Spotify API');
    } else return new ApiError(err.response.status, 'Something went wrong');
  } else {
    console.error(err);
    return ApiError.internal('Unknown error occured');
  }
}

// Accesses the Spotify API and searches for artists
module.exports = {
  searchForArtistByName: async function(name) {
    const url = 'https://api.spotify.com/v1/search?';
    let params = new URLSearchParams({
      access_token: await getAccessToken(),
      token_type: 'Bearer',
      q: name,
      type: 'artist'
    }).toString();

    try {
      return await axios.get(`${url}${params}`).then((response) => response.data.artists.items);
    } catch (err) {
      const apiError = await handleError(err);
      if (apiError.code === 401) {
        try {
          params = new URLSearchParams({
            access_token: await getAccessToken(),
            token_type: 'Bearer',
            q: name,
            type: 'artist'
          }).toString();
          return await axios.get(`${url}${params}`).then((response) => response.data.artists.items);
        } catch (_err) {
          return await handleError(_err);
        }
      } else return apiError;
    }
  },
  searchForArtistById: async function(id) {
    const url = `https://api.spotify.com/v1/artists/${id}?`;
    let params = new URLSearchParams({
      access_token: await getAccessToken(),
      token_type: 'Bearer'
    }).toString();

    try {
      return await axios.get(`${url}${params}`).then((response) => response.data);
    } catch (err) {
      const apiError = await handleError(err);
      if (apiError.code === 401) {
        try {
          params = new URLSearchParams({
            access_token: await getAccessToken(),
            token_type: 'Bearer',
            q: name,
            type: 'artist'
          }).toString();
          return await axios.get(`${url}${params}`).then((response) => response.data);
        } catch (_err) {
          return await handleError(_err);
        }
      } else return apiError;
    }
  },
  searchForRelatedArtists: async function(id) {
    const url = `https://api.spotify.com/v1/artists/${id}/related-artists?`
    let params = new URLSearchParams({
      access_token: await getAccessToken(),
      token_type: 'Bearer'
    }).toString();

    try {
      return await axios.get(`${url}${params}`).then((response) => response.data.artists);
    } catch (err) {
      const apiError = await handleError(err);
      if (apiError.code === 401) {
        try {
          params = new URLSearchParams({
            access_token: await getAccessToken(),
            token_type: 'Bearer',
            q: name,
            type: 'artist'
          }).toString();
          return await axios.get(`${url}${params}`).then((response) => response.data.artists);
        } catch (_err) {
          return await handleError(_err);
        }
      } else return apiError;
    }
  }
}