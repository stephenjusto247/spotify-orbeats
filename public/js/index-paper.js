// Retrieve the data of the most recently searched artists
var artists = JSON.parse(document.getElementById("artists").innerText);
// Set up for visualizing the artists
var maxPoint = new Point(view.size.width, view.size.height);
var center = maxPoint / 2;
var radius = 30;
// Create a group to store the visual stuff in
var objects = new Group();
// Create an array that will hold all Representation instances
var representations = [];
// Create a Representation that will hold the data on the artists
// as well as their visual components in the graph
function Representation(circle, text, artistData, dist){
    this.circle = circle;
    this.text = text;
    this.data = artistData;
    // Initial distance of the circle from the center
    // we store this value since we want to keep this
    // distance the same
    this.distanceFromCenter = dist;
    // Randomly choose a value for dir (either 0 or 1)
    // This value is used to decide which direction
    // The circle will revolve around the center
    // either clockwise or counter-clockwise
    this.dir = Math.floor(Math.random() * 2);
}
// Does some trig to get the point on a circle of a certain radius
// on a certain angle in degrees
function getPointOnCircle(radius, angleInDegrees, origin){
    var hor = radius * Math.cos(angleInDegrees * Math.PI / 180) + origin.x;
    var ver = radius * Math.sin(angleInDegrees * Math.PI / 180) + origin.y;
    return new Point(hor, ver);
}
function getAngleFromCircle(point, origin){
    return Math.atan2(point.y - origin.y, point.x - origin.x) * 180 / Math.PI;
}
// Proceed to visualize every artist
for(var i = 0; i < artists.length; i++){
    // Create a random point
    var randomPoint = maxPoint * Point.random();
    // Calculate the directional vector from
    // the center to the random point
    var horizontal = randomPoint.x - center.x;
    var vertical = randomPoint.y - center.y;
    var magnitude = Math.sqrt((horizontal * horizontal) + (vertical * vertical));
    var direction = new Point(horizontal, vertical) / magnitude;
    // Calculate a final point based on the directional vector
    var distance = i * 1.5 * radius + radius;
    var finalPoint = new Point(direction.x * distance, direction.y * distance) + center;
    // Visualize the artist using the final point
    var artistCircle = new Path.Circle(finalPoint, radius);
    artistCircle.fillColor = {
        gradient: {
            stops: [["yellow", 0.2], ['orange', 0.4], ["rgb(255,81,0,0)", 1]],
            radial: true
        },
        origin: artistCircle.position,
        destination: artistCircle.bounds.rightCenter
    };
    artistText = new PointText({point: finalPoint, 
        fillColor: "black", 
        fontWeight: 900,
        content: artists[i].name});
    
    objects.addChild(artistCircle);
    objects.addChild(artistText);
    // Create a Representation instance of this particular artist and push it into the array
    representations.push(new Representation(artistCircle, artistText, artists[i], distance));
}
// Move every single object in the graph on
// mouse drag
// Gives the illusion that we are moving around
// in the graph
function onMouseDrag(e){
    objects.position += e.delta;
    center.position += e.delta;
 }
// Manipulates each circle's position so that
// they revolve around the center every frame
function onFrame(){
    for(var i = 0; i < artists.length; i++){ 
        var distanceFromCenter = representations[i].distanceFromCenter;
        var currentAngle = getAngleFromCircle(representations[i].circle.position, center);
        var speed = 1;

        if (representations[i].dir === 0)
        {
            representations[i].circle.position = getPointOnCircle(distanceFromCenter, 
                currentAngle + speed * ((representations.length - i)/(representations.length - 1)), 
                center);
        }
        else{
            representations[i].circle.position = getPointOnCircle(distanceFromCenter, 
                currentAngle - speed * ((representations.length - i)/(representations.length - 1)), 
                center);
        }
        representations[i].text.position = representations[i].circle.position;
    }
}