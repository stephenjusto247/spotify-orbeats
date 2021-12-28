// Extract variables from EJS
var relatedArtists = JSON.parse(document.getElementById("relatedArtists").innerText);
var artist = JSON.parse(document.getElementById("artist").innerText);
// Create groups
var objects = new Group();
var relatedArtistVisuals = new Group();
// Set up for visualizing the artists
var maxPoint = new Point(view.size.width, view.size.height);
var center = maxPoint / 2;
var radius = 15;
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
    this.dir = Math.random() < 0.5 ? 0 : 1;
}
// Chooses a color for the visual representation of the
// artists based on their popularity (0-100)
// Color ranges from black, purple, blue, cyan,
// green, yellow, orange, red, and white, respectively
function chooseColor(popularity){
    if (popularity <= 11){
        return "rgb(0,0,0)";
    }
    else if (popularity >= 12 && popularity <= 22){
        return "rgb(128,0,128)";
    }
    else if (popularity >= 23 && popularity <= 34){
        return "rgb(0,0,255)";
    }
    else if (popularity >= 34 && popularity <= 44){
        return "rgb(0,255,255)";
    }
    else if (popularity >= 45 && popularity <= 55){
        return "rgb(0,255,0)";
    }
    else if (popularity >= 56 && popularity <= 66){
        return "rgb(255,255,0)";
    }
    else if (popularity >= 67 && popularity <= 77){
        return "rgb(255,165,0)";
    }
    else if (popularity >= 78 && popularity <= 88){
        return "rgb(255,0,0)";
    }
    else if (popularity >= 89){
        return "rgb(255,255,255)";
    }
}
function generateGraphLegend()
{
    var x = ((8/9) * view.size.width +(view.size.width+(8/9)*view.size.width)/2)/2 - 15;
    var title = new PointText({point: new Point(x - 30, 15),
        fillColor: 'white',
        fontWeight: 500,
        content: 'Popularity (0-100)'});
    for (var i = 0; i < 9; i++){
        var firstPoint = new Point(x, (view.size.height*i)/30 + 20);
        var secondPoint = new Point((view.size.width+(6/7)*view.size.width)/2,(view.size.height*(i + 1))/30 + 20);
        var first = new Rectangle(firstPoint, secondPoint);
        var n = new Path.Rectangle(first);
        var label = new PointText({point: new Point(secondPoint.x + 5, secondPoint.y -3),
            fillColor: 'white',
            fontWeight: 500,
            content: "?-?"});
        if (i===0){
            n.fillColor = "black";
            label.content = "0-11";
        }
        else if (i===1){
            n.fillColor = "purple";
            label.content = "12-22";
        }
        else if (i===2){
            n.fillColor = "blue";
            label.content = "23-33"
        }
        else if (i===3){
            n.fillColor = "cyan";
            label.content = "34-44"
        }
        else if (i===4){
            n.fillColor = "green";
            label.content = "45-55";
        }
        else if (i===5){
            n.fillColor = "yellow";
            label.content = "56-66";
        }
        else if (i===6){
            n.fillColor = "orange";
            label.content = "67-77";
        }
        else if (i===7){
            n.fillColor ="red";
            label.content = "78-88";
        }
        else{
            n.fillColor="white";
            label.content = "89-100";
        }
    }
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
relatedArtistVisuals.onMouseEnter = function(e){
    document.getElementById("myCanvas").style.cursor = "pointer";
}
relatedArtistVisuals.onMouseLeave = function(e){
    document.getElementById("myCanvas").style.cursor = "default";
}

// Main stuff below----------------------------------------------
// Visualize the target artist at the center of the canvas
var myTarget = new Path.Circle(center, radius);
var color = chooseColor(artist.popularity);
myTarget.name = "0d";
myTarget.fillColor = {
    gradient: {
        stops: [['white', 0.05], [color, 0.2], [color.substring(0, color.length-1) + ", 0)", 1]],
        radial: true
    },
    origin: myTarget.position,
    destination: myTarget.bounds.rightCenter
};
myTargetText = new PointText({point: center, 
    fillColor: "black", 
    fontWeight: 900,
    content: artist.name
});
// Add the target artist to the objects group
objects.addChild(myTarget);
objects.addChild(myTargetText);
// Create a Representation instance of the target artist and push it into the array
representations.push(new Representation(myTarget, myTargetText, artist, 0));
// Visualize artists related to the "target"
// The closer the artist is to the target, the more "related" they are
// I believe "relatedArtists" is sorted from most related to least related...
for (var i = 0; i < relatedArtists.length; i++){
    // Create a random point
    var randomPoint = maxPoint * Point.random();
    // Calculate the directional vector from
    // the center to the random point
    var horizontal = randomPoint.x - center.x;
    var vertical = randomPoint.y - center.y;
    var magnitude = Math.sqrt((horizontal * horizontal) + (vertical * vertical));
    var direction = new Point(horizontal, vertical) / magnitude;
    // Create the final point based on the directional vector
    // Most related artists are closer to center
    // Least related artists are farther from the center
    var distance = ((i + 1) / 20 * center.y) + radius + (i * radius);
    var finalPoint = new Point(direction.x * distance, direction.y * distance) + center;
    // Visualize the artist's path of revolution
    var newPath = new Path();
    newPath.strokeColor = "orange";
    for (var j = 0; j < 361; j++){
        newPath.add(getPointOnCircle(distance, j, center));
    }
    // Visualize the artist itself  
    var artistCircle = new Path.Circle(finalPoint, radius);
    var rgbColor = chooseColor(relatedArtists[i].popularity);
    artistCircle.fillColor = {
        gradient: {
            stops: [['white', 0.05], [rgbColor, 0.2], [rgbColor.substring(0, rgbColor.length - 1) + ",0)", 1]],
            radial: true
        },
        origin: artistCircle.position,
        destination: artistCircle.bounds.rightCenter
    };
    var artistText = new PointText({point: finalPoint, 
        fillColor: "black",
        fontWeight: 900, 
        content: relatedArtists[i].name});
    // Add properties to the visuals
    var name = (i+1).toString() + "d";
    artistCircle.name = name;
    artistText.name = name;
    artistCircle.onClick = function(e){
        if (e.target.name.charAt(1) >= '0' && e.target.name.charAt(1) <= '9'){
            window.location = document.getElementById(representations[e.target.name.substring(0,2)].data.id).href;
        }
        else{
            window.location = document.getElementById(representations[e.target.name.charAt(0)].data.id).href;
        }
    }
    artistText.onClick = function(e){
        if (e.target.name.charAt(1) >= '0' && e.target.name.charAt(1) <= '9'){
            window.location = document.getElementById(representations[e.target.name.substring(0,2)].data.id).href;
        }
        else{
            window.location = document.getElementById(representations[e.target.name.charAt(0)].data.id).href;
        }
    }
    // Add the visuals to their respective groups
    objects.addChild(newPath);
    relatedArtistVisuals.addChild(artistCircle);
    relatedArtistVisuals.addChild(artistText);
    // Create a Representation instance of this particular artist and push it into the array
    representations.push(new Representation(artistCircle, artistText, relatedArtists[i], distance));
}
// Finally, draw the legend for the graph
generateGraphLegend();
// Move the artists' path on mouse drag
function onMouseDrag(e){
    objects.position += e.delta;
}
function onFrame(){
    for(var i = 0; i < representations.length; i++)
    {
        // Related artists revolve around the target
        // The target is always considered the "center"
        if (i != 0)
        {
            var distanceFromCenter = representations[i].distanceFromCenter;
            var currentAngle = getAngleFromCircle(representations[i].circle.position, myTarget.position);
            var speed = .25;

            if (representations[i].dir == 0)
            {
                representations[i].circle.position = getPointOnCircle(distanceFromCenter, currentAngle + speed * ((representations.length - i)/(representations.length - 1)), myTarget.position);
            }
            else{
                representations[i].circle.position = getPointOnCircle(distanceFromCenter, currentAngle - speed * ((representations.length - i)/(representations.length - 1)), myTarget.position);
            }
            representations[i].text.position = representations[i].circle.position;
        }
    }
}