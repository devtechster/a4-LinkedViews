var canvasWidth = 960,
    cellSize = 230,
    paddingValue = 20;

var xScale = d3.scale.linear()
    .range([paddingValue / 2, cellSize - paddingValue / 2]);

var yScale = d3.scale.linear()
    .range([cellSize - paddingValue / 2, paddingValue / 2]);

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .ticks(6);

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .ticks(6);

var colorScale = d3.scale.category10();

d3.csv("data.csv", function(error, data) {
  if (error) throw error;

  var traitExtent = {},
      traits = d3.keys(data[0]).filter(function(d) { return d !== "name"; }),
      traitCount = traits.length;

  traits.forEach(function(trait) {
    traitExtent[trait] = d3.extent(data, function(d) { return d[trait]; });
  });

  xAxis.tickSize(cellSize * traitCount);
  yAxis.tickSize(-cellSize * traitCount);

  var brushing = d3.svg.brush()
      .x(xScale)
      .y(yScale)
      .on("brushstart", brushstart)
      .on("brush", brushmove)
      .on("brushend", brushend);

  var svgCanvas = d3.select("body").append("svg")
      .attr("width", cellSize * traitCount + paddingValue)
      .attr("height", cellSize * traitCount + paddingValue)
    .append("g")
      .attr("transform", "translate(" + paddingValue + "," + paddingValue / 2 + ")");

  svgCanvas.selectAll(".x.axis")
      .data(traits)
    .enter().append("g")
      .attr("class", "x axis")
      .attr("transform", function(d, i) { return "translate(" + (traitCount - i - 1) * cellSize + ",0)"; })
      .each(function(d) { xScale.domain(traitExtent[d]); d3.select(this).call(xAxis); });

  svgCanvas.selectAll(".y.axis")
      .data(traits)
    .enter().append("g")
      .attr("class", "y axis")
      .attr("transform", function(d, i) { return "translate(0," + i * cellSize + ")"; })
      .each(function(d) { yScale.domain(traitExtent[d]); d3.select(this).call(yAxis); });

  var cellGroup = svgCanvas.selectAll(".cell")
      .data(cross(traits, traits))
    .enter().append("g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + (traitCount - d.i - 1) * cellSize + "," + d.j * cellSize + ")"; })
      .each(plotData);

  // Titles for the diagonal.
  cellGroup.filter(function(d) { return d.i === d.j; }).append("text")
      .attr("x", paddingValue)
      .attr("y", paddingValue)
      .attr("dy", ".71em")
      .text(function(d) { return d.x; });

  cellGroup.call(brushing);

  function plotData(p) {
    var currentCell = d3.select(this);

    xScale.domain(traitExtent[p.x]);
    yScale.domain(traitExtent[p.y]);

    currentCell.append("rect")
        .attr("class", "frame")
        .attr("x", paddingValue / 2)
        .attr("y", paddingValue / 2)
        .attr("width", cellSize - paddingValue)
        .attr("height", cellSize - paddingValue);

    currentCell.selectAll("circle")
        .data(data)
      .enter().append("circle")
        .attr("cx", function(d) { return xScale(d[p.x]); })
        .attr("cy", function(d) { return yScale(d[p.y]); })
        .attr("r", 4)
        .style("fill", function(d) { return colorScale(d.species); });
  }

  var activeBrushCell;

  // Clear the previously-active brush, if any.
  function brushstart(p) {
    if (activeBrushCell !== this) {
      d3.select(activeBrushCell).call(brushing.clear());
      xScale.domain(traitExtent[p.x]);
      yScale.domain(traitExtent[p.y]);
      activeBrushCell = this;
    }
  }

  // Highlight the selected circles.
  function brushmove(p) {
    var brushExtent = brushing.extent();
    svgCanvas.selectAll("circle").classed("hidden", function(d) {
      return brushExtent[0][0] > d[p.x] || d[p.x] > brushExtent[1][0]
          || brushExtent[0][1] > d[p.y] || d[p.y] > brushExtent[1][1];
    });
  }

  // If the brush is empty, select all circles.
  function brushend() {
    if (brushing.empty()) svgCanvas.selectAll(".hidden").classed("hidden", false);
  }
});

function cross(a, b) {
  var result = [], aLength = a.length, bLength = b.length, i, j;
  for (i = -1; ++i < aLength;) for (j = -1; ++j < bLength;) result.push({x: a[i], i: i, y: b[j], j: j});
  return result;
}
