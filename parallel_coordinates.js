/**
 * References:
 * https://bl.ocks.org/jasondavies/1341281
 */

var x, y, dragging = {};

/**
 * Function loadParallelCoordinates: Renders the parallel coordinates chart into a specified SVG container
 */
function loadParallelCoordinates(svg, height, width, base_data, top_margin, bottom_margin) {
    dimensions = ["HP", "Attack",  "Speed", "Defense"];

    // For each dimension, I build a linear scale. I store all in a y object
    y = {}
    for (i in dimensions) {
        var name = dimensions[i]
        y[name] = d3.scaleLinear()
            .domain( d3.extent(base_data, function(d) { return +d[name]; }) )
            .range([height - bottom_margin, top_margin]);
    }

    // Build the X scale -> it find the best position for each Y axis
    x = d3.scalePoint()
        .range([0, width])
        .padding(0.5)
        .domain(dimensions);

    // Draw the lines
    var pc_lines = svg.append("g")
        .attr("class", "pc_lines")
        .selectAll("path")
        .data(base_data)
        .enter().append("path")
        .attr("d",  path)
        .style("fill", "none")
        .style("opacity", 0.5);

    // Add a group element for each dimension.
    var g = svg.selectAll(".dimension")
        .data(dimensions).enter()
        .append("g")
        .attr("class", "dimension")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        .call(d3.drag()
            .subject(function(d) { return {x: x(d)}; })
            .on("start", function(d) {
                dragging[d] = x(d);
            })
            .on("drag", function(d) {
                dragging[d] = Math.min(width, Math.max(0, d3.event.x));
                pc_lines.attr("d", path);
                dimensions.sort(function(a, b) { return position(a) - position(b); });
                x.domain(dimensions);
                g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
            })
            .on("end", function(d) {
                delete dragging[d];
                transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                transition(pc_lines).attr("d", path);
            }));

    // Add an axis and title.
    g.append("g")
        .attr("class", "axis")
        .each(function(d) { d3.select(this).call(d3.axisLeft(y[d])); })
        .append("text")
        .attr("class", "axis_title")
        .style("text-anchor", "middle")
        .attr("y", top_margin - 20)
        .text(function(d) { return d; })
        .style("fill", "black");
}

function position(d) {
    var v = dragging[d];
    return v == null ? x(d) : v;
}

function path (d) {
    return d3.line()(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
}

function transition (g) {
    return g.transition().duration(500);
}