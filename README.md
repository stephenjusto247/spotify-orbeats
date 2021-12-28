<h2 align="center">Spotify Orbeats</h3>

<p align="center">A magnificent representation of Spotify's related artists</p>

### [Demo - Check out the application here](http://spotify-orbeats.herokuapp.com/)

## What's Spotify Orbeats?

**A web application built using ExpressJS that accesses the Spotify API and visualizes their data on related artists.**

- Search for your favorite artists
- Learn how popular your favorite artist is on Spotify
- Find similar artists

### Demo and Screenshots

![Demo](https://user-images.githubusercontent.com/23348308/108803870-a3bf7880-7550-11eb-8ccd-96abb929b3ac.gif)

<div>
  <h3 align="center">Home</h3>
  <img src="screenshots/home.JPG" />
  <h3 align="center">Searching</h3>
  <img src="screenshots/search.JPG" />
  <img src="screenshots/result.JPG" />
  <h3 align="center">Related Artists</h3>
  <img src="screenshots/related.JPG" />
  <img src="screenshots/related2.JPG" />
  <h3 align="center">Graph</h3>
  <img src="https://user-images.githubusercontent.com/23348308/108799973-b46af100-7546-11eb-9a62-bd2a0fb41b9c.PNG" />
  <p>
    The artist of interest is always displayed on the center of the canvas with the related artists revolving around them. Additionally,
    the colors of the artists represent their popularities. The colors from the least popular to most popular are black, purple, blue, cyan, 
    green, yellow, orange, red, and white.
  </p>
</div>

The application also utilizes MongoDB to keep track of users' most recent searches and the authorization tokens required to access the Spotify API.
