/**
 * References:
 * https://bl.ocks.org/jasondavies/1341281
 */

var x, y, dragging = {};
var _data = {};

/**
 * Function loadParallelCoordinates: Renders the parallel coordinates chart into a specified SVG container
 */
function loadParallelCoordinates(svg, height, width, base_data, top_margin, bottom_margin) {
    dimensions = ["HP", "Attack",  "Speed", "Defense"];
    _data = base_data;

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

    // Draw the background lines
    var background = svg.append("g")
        .attr("class", "background")
        .selectAll("path")
        .data(base_data)
        .enter().append("path")
        .attr("d",  path)
        .style("fill", "none")
        .style("opacity", 0.5);

    // Draw the foreground lines
    var foreground = svg.append("g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(base_data)
        .enter()
        .append("path")
        .attr("d",  path)
        .style("fill", "none")
        .style("opacity", 0.5)
        .attr("id", function(d) {
            return d["Name"];
        })
        .attr("class", function(d) {
            let classes =  "pc_line " + d["Type 1"];
            let t2;
            if (t2 = d["Type 2"])
                classes += " " + t2;

            return classes;
        })
        .on("click", function(d) {
            document.getElementById('search_input').value = d["Name"];
            onSearchClicked();
        });

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
                background.attr("visibility", "hidden");
            })
            .on("drag", function(d) {
                dragging[d] = Math.min(width, Math.max(0, d3.event.x));
                foreground.attr("d", path);
                dimensions.sort(function(a, b) { return position(a) - position(b); });
                x.domain(dimensions);
                g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
            })
            .on("end", function(d) {
                delete dragging[d];
                transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                transition(foreground).attr("d", path);
                background
                    .attr("d", path)
                    .transition()
                    .delay(500)
                    .duration(0)
                    .attr("visibility", null);
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

function onSearchClicked() {
    var input = document.getElementById('search_input');

    var result = _data.find(element => (element["Name"].toLowerCase() === input.value.toLowerCase()));
    if (result) {
        let pathMatch = d3.select("#" + result["Name"]);
        if (pathMatch.style("display") === "none") {
            alert("Searched Pokémon currently disabled from heatmap selection");
            input.value = "";
        }
        else {
            let resultBox = d3.select("#search_results");
            resultBox.selectAll("text").remove();
            d3.select("path.pc_selected").classed("pc_selected", false);
            resultBox.append("text")
                .attr("x", 0)
                .attr("y", 50)
                .attr("dy", ".35em")
                .text(result["Name"]);
            resultBox.append("text")
                .attr("x", 0)
                .attr("y", 70)
                .attr("dy", ".35em")
                .text("HP: " + result["HP"]);
            resultBox.append("text")
                .attr("x", 0)
                .attr("y", 90)
                .attr("dy", ".35em")
                .text("Attack: " + result["Attack"]);
            resultBox.append("text")
                .attr("x", 0)
                .attr("y", 110)
                .attr("dy", ".35em")
                .text("Speed: " + result["Speed"]);
            resultBox.append("text")
                .attr("x", 0)
                .attr("y", 130)
                .attr("dy", ".35em")
                .text("Defense: " + result["Defense"]);

            pathMatch.classed("pc_selected", true);
        }
    } else {
        alert("Invalid Input! Please try again.");
        document.getElementById('search_input').value = "";
    }
}

function onResetClicked() {
    document.getElementById('search_input').value = "";
    var resultBox = d3.select("#search_results");
    resultBox.selectAll("text").remove();
    d3.select("path.pc_selected").classed("pc_selected", false);
}