const jsdom = require('jsdom');

const { JSDOM } = jsdom;

const d3 = require('d3');
const fs = require('fs');

const dom = new JSDOM(`<!DOCTYPE html><body></body>`);

function inside(point, vs) {

  const x = point[0];

  const y = point[1];

  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0];

    const yi = vs[i][1];
    const xj = vs[j][0];

    const yj = vs[j][1];

    const intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

module.exports = (long = 0, lat = 0) => {
  dom.window.document.querySelector('body').innerHTML = '';
  const body = d3.select(dom.window.document.querySelector('body'));

  console.log('body', dom.window.document.querySelector('body').innerHTML);
  const svg = body
    .append('svg')
    .attr('width', 500)
    .attr('height', 500)
    .attr('xmlns', 'http://www.w3.org/2000/svg');
  console.log('svg', svg);

  const data = JSON.parse(fs.readFileSync(`${__dirname}/world.json`, 'utf8'));

  const aa = [long, lat];
  const bb = [long, lat];
  let maxX = 0;
  let minX = 0;
  let minY = 0;
  let maxY = 0;
  let cenX = 0;
  let cenY = 0;
  let zoom = 0;
  //     // Filter data
  data.features = data.features.filter(function(d) {
    let boundary;
    let result = false;
    if (d.geometry.type == 'Polygon') {
      boundary = d.geometry.coordinates[0];
      minX = boundary[0][0];
      maxX = boundary[0][0];
      minY = boundary[0][1];
      maxY = boundary[0][1];

      boundary.map(coor => {
        if (coor[0] < minX) minX = coor[0];
        if (coor[0] > maxX) maxX = coor[0];
        if (coor[1] < minY) minY = coor[1];
        if (coor[1] > maxY) maxY = coor[1];
      });
      result = inside([long, lat], boundary);
    } else {
      const boundaries = d.geometry.coordinates;
      minX = boundaries[0][0][0][0];
      maxX = boundaries[0][0][0][0];
      minY = boundaries[0][0][0][1];
      maxY = boundaries[0][0][0][1];
      boundaries.forEach(items => {
        items.forEach(item => {
          item.forEach(coor => {
            if (coor[0] < minX) minX = coor[0];
            if (coor[0] > maxX) maxX = coor[0];
            if (coor[1] < minY) minY = coor[1];
            if (coor[1] > maxY) maxY = coor[1];
          });
        });
        if (inside([long, lat], items[0]) == true) result = true;
      });
      boundary = d.geometry.coordinates[0][0];
    }

    if (result == true) {
      cenX = (minX + maxX) / 2;
      cenY = (minY + maxY) / 2;
      console.log('cenx', cenX);
      console.log('cenY', cenY);
      console.log('minx', minX);
      console.log('maxX', maxX);
      console.log('minY', minY);
      console.log('maxY', maxY);
      if (maxX - minX > maxY - minY) zoom = 25000 / (maxX - minX);
      else zoom = 25000 / (maxY - minY);
      return true;
    }
  });

  const projection = d3
    .geoMercator()
    .center([cenX, cenY]) // GPS of location to zoom on
    .scale(zoom) // This is like the zoom
    .translate([500 / 2, 500 / 2]);

  // Draw the map
  svg
    .append('g')
    .selectAll('path')
    .data(data.features)
    .enter()
    .append('path')
    .attr('fill', 'gray')
    .attr('d', d3.geoPath().projection(projection))
    .style('stroke', 'none');
  svg
    .selectAll('circle')
    .data([aa, bb])
    .enter()
    .append('circle')
    .attr('cx', function(d) {
      console.log(projection(d));
      return projection(d)[0];
    })
    .attr('cy', function(d) {
      return projection(d)[1];
    })
    .attr('r', '8px')
    .attr('fill', 'red');

  if (data.features.length > 0) return body.html();
  return 'That coordinate is not within the country';
};
