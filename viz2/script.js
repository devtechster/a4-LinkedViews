d3.csv("data.csv", function(error, data) {
    if (error) throw error;
  
    // Scatter Plot
    var scatterplotMargin = {top: 20, right: 20, bottom: 30, left: 40},
        scatterplotWidth = 400 - scatterplotMargin.left - scatterplotMargin.right,
        scatterplotHeight = 300 - scatterplotMargin.top - scatterplotMargin.bottom;
  
    var scatterplotSvg = d3.select("#scatterplot")
        .append("svg")
        .attr("width", scatterplotWidth + scatterplotMargin.left + scatterplotMargin.right)
        .attr("height", scatterplotHeight + scatterplotMargin.top + scatterplotMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + scatterplotMargin.left + "," + scatterplotMargin.top + ")");
  
    var scatterplotX = d3.scaleLinear()
        .range([0, scatterplotWidth]);
  
    var scatterplotY = d3.scaleLinear()
        .range([scatterplotHeight, 0]);
  
    scatterplotX.domain([0, d3.max(data, function(d) { return +d.column1; })]);
    scatterplotY.domain([0, d3.max(data, function(d) { return +d.column2; })]);
  
    scatterplotSvg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function(d) { return scatterplotX(+d.column1); })
        .attr("cy", function(d) { return scatterplotY(+d.column2); })
        .style("fill", function(d) { return getColor(d.column5); });
  
    // Grouped Bar Chart
    var barchartMargin = {top: 20, right: 20, bottom: 30, left: 40},
        barchartWidth = 400 - barchartMargin.left - barchartMargin.right,
        barchartHeight = 300 - barchartMargin.top - barchartMargin.bottom;
  
    var barchartSvg = d3.select("#barchart")
        .append("svg")
        .attr("width", barchartWidth + barchartMargin.left + barchartMargin.right)
        .attr("height", barchartHeight + barchartMargin.top + barchartMargin.bottom)
        .append("g")
        .attr("transform", "translate(" + barchartMargin.left + "," + barchartMargin.top + ")");
  
    var categories = ["AMD", "Ryzen", "Intel"];
    var columnNames = ["column1", "column2", "column3", "column4"];
  
    var x0 = d3.scaleBand()
        .rangeRound([0, barchartWidth])
        .paddingInner(0.1);
  
    var x1 = d3.scaleBand()
        .padding(0.05);
  
    var y = d3.scaleLinear()
        .range([barchartHeight, 0]);
  
    x0.domain(categories);
    x1.domain(columnNames).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(data, function(d) { return d3.max(columnNames, function(column) { return +d[column]; }); })]);
  
    var color = d3.scaleOrdinal()
        .range(["#98abc5", "#8a89a6", "#7b6888"]);
  
    var xAxis = d3.axisBottom(x0);
    var yAxis = d3.axisLeft(y);
  
    barchartSvg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + barchartHeight + ")")
        .call(xAxis);
  
    barchartSvg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Value");
  
    var barGroups = barchartSvg.selectAll(".barGroup")
        .data(data)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(" + x0(d.column5) + ",0)"; });
  
    barGroups.selectAll("rect")
        .data(function(d) { return columnNames.map(function(column) { return {column: column, value: +d[column]}; }); })
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x1(d.column); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", x1.bandwidth())
        .attr("height", function(d) { return barchartHeight - y(d.value); })
        .style("fill", function(d) { return color(d.column); });
  
    function getColor(category) {
      if (category === "AMD") return "#1f77b4";
      else if (category === "Ryzen") return "#ff7f0e";
      else if (category === "Intel") return "#2ca02c";
      else return "#ccc"; // Default color
    }
  });
  