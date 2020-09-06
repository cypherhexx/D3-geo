'use strict';

var jsdom = require('jsdom');
const { JSDOM } = jsdom;

const d3 = require('d3');
const fs = require('fs');



const dom = new JSDOM(`<!DOCTYPE html><body></body>`);



// })

//console.log(body.html());

//fs.writeFileSync('out7.svg', body.html());

function inside(point, vs) {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html
    
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};

module.exports = (name = 'world') => {

  let body = d3.select(dom.window.document.querySelector("body"))
  let svg = body.append('svg').attr('width', 400).attr('height', 400).attr('xmlns', 'http://www.w3.org/2000/svg');
  
  
  var projection = d3.geoMercator()
  .center([67.7100, 33.9391])                // GPS of location to zoom on
  .scale(980)                       // This is like the zoom
  .translate([ 400/2, 400/2 ])
  var data = JSON.parse(fs.readFileSync(__dirname +"/world.json", 'utf8'));
  
  var aa = [67.7100, 33.9391];
  var bb = [67.6100, 33.8391];
  
  // Load external data and boot
  // d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson", function(data){
  
  //     // Filter data
  data.features = data.features.filter(function(d){
      //console.log(d.properties.name) ; 
      //console.log(d.geometry.coordinates[0][0]);
      var boundary;
      if(d.geometry.type == "Polygon") boundary = d.geometry.coordinates[0];
      else {
          var boundaries = d.geometry.coordinates[0];
          boundaries.map(item => {
              if(inside([67.7100, 33.9391],item) == true)
              var result =  false;
          })
          boundary = d.geometry.coordinates[0][0];
      }
      var result = inside([67.7100, 33.9391],boundary);
      if(result === true) console.log(d.properties.name);
  
      //console.log("boundary", boundary);
  
      return d.properties.name=="Afghanistan"
  })
  
  
  
  
  // Draw the map
  svg.append("g")
      .selectAll("path")
      .data(data.features)
      .enter()
      .append("path")
          .attr("fill", "gray")
          .attr("d", d3.geoPath()
              .projection(projection)
          )
      .style("stroke", "none");
  svg.selectAll("circle")
  .data([aa,bb]).enter()
  .append("circle")
  .attr("cx", function (d) { console.log(projection(d)); return projection(d)[0]; })
  .attr("cy", function (d) { return projection(d)[1]; })
  .attr("r", "8px")
  .attr("fill", "red")

  console.log("json", body.html());
  return `Hello ${name}!`;
};
