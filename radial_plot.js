const features = ["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"];
const colors = ["darkgreen", "deeppink", "darkorange", "navy"];
const evolCategories = ["Does Not Evolve", "1st Evolution", "2nd Evolution", "3rd Evolution"];

function onButtonClick(e) {
    var d3button = d3.select("#collapse_button");
    var button = d3button._groups[0][0];

    if (button.innerText === "Expand") {
        button.innerText = "Collapse";
        d3.select("#vis1").style("display", "none");
        d3.select("#expand_div").style("display", "inline-block");

        var expandedSvgs = d3.select("#expand_div").selectAll("svg.svg_boxes_expanded");
        console.log(expandedSvgs);

        if (expandedSvgs._groups[0].length === 0) {
            d3.select("#expand_div")
                .append("svg")
                .attr("id", "vis1-expand1")
                .attr("class", "svg_boxes_expanded");
            d3.select("#expand_div")
                .append("svg")
                .attr("id", "vis1-expand2")
                .attr("class", "svg_boxes_expanded");
            d3.select("#expand_div")
                .append("svg")
                .attr("id", "vis1-expand3")
                .attr("class", "svg_boxes_expanded");
            d3.select("#expand_div")
                .append("svg")
                .attr("id", "vis1-expand4")
                .attr("class", "svg_boxes_expanded");

            var data = avgDataByColumn(base_data, features, "Evolution");
            data.sort((a, b) => (a["Evolution"] > b["Evolution"]) ? 1 : -1);
            addStarPlot(data,0);
            addStarPlot(data,1);
            addStarPlot(data,2);
            addStarPlot(data,3);
        }
    } else {
        button.innerText = "Expand";
        d3.select("#vis1").style("display", "block");
        d3.select("#expand_div").style("display", "none");
    }
}

function addStarPlot(data, index) {
    var temp = [];
    temp.push(data[index]);

    var svg = grabSvgDimensions("vis1-expand" + (index + 1));
    console.log(svg);
    drawStarPlot(svg[0], temp, svg[2], svg[1], 50, index, false);
}


/**
 * Function loadStarPlot: Renders the star plot into a specified SVG container
 */
function loadStarPlot(svg, height, width, base_data, top_margin) {
    var data = avgDataByColumn(base_data, features, "Evolution");
    data.sort((a, b) => (a["Evolution"] > b["Evolution"]) ? 1 : -1);
    drawStarPlot(svg, data, height, width, top_margin, 0, true);
}

function addLegend(svg, data, top_margin, isOriginal) {
// Initialize the element containers for the legend items
    var legend = svg.selectAll("g.sp_legend")
        .data(data)
        .enter().append("g")
        .attr("class", "sp_legend")
        .attr("transform", function (d, i) {
            return "translate(50," + i * 25 + ")";
        });

    // Initialize the color box of the legend items
    legend.append("rect")
        .attr("x", 0)
        .attr("y", top_margin)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function (d) {
            return colors[d["Evolution"]];
        });

    // Initialize the text label of the legend items
    legend.append("text")
        .attr("x", 22)
        .attr("y", top_margin + 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(function (d, i) {
            let evol = d["Evolution"];
            return evolCategories[evol];
        });
}

function drawStarPlot(svg, data, height, width, top_margin, color_index, isOriginal) {
    var x_center_start = width * 0.5;
    var y_center_start = height * 0.5;
    if (isOriginal)
    {
        x_center_start = width * 0.6;
        y_center_start = height * 0.45;
    }

    let radialScale = d3.scaleLinear().domain([0, 100])
        .range([0, height * 0.35]);

    let ticks = [20, 40, 60, 80, 100];
    // Draw grid lines (circles)
    ticks.forEach(t =>
        svg.append("circle")
            .attr("cx", x_center_start)
            .attr("cy", y_center_start)
            .attr("fill", "none")
            .attr("stroke", "gray")
            .attr("r", radialScale(t))
    );
    // Draw tick labels
    ticks.forEach(t =>
        svg.append("text")
            .attr("x", x_center_start + 5)
            .attr("y", y_center_start - radialScale(t))
            .style("font-size", (isOriginal) ? "small" : "x-small")
            .text(t.toString())
    );
    // Draw axis for each feature
    var angleToCoordinate = (angle, value) => {
        let x = Math.cos(angle) * radialScale(value);
        let y = Math.sin(angle) * radialScale(value);
        return {"x": x_center_start + x, "y": y_center_start - y};
    };

    for (var i = 0; i < features.length; i++) {
        let ft_name = features[i];
        let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        let line_coordinate = angleToCoordinate(angle, 100);
        let label_coordinate = angleToCoordinate(angle, 120);
        svg.append("line")
            .attr("x1", x_center_start)
            .attr("y1", y_center_start)
            .attr("x2", line_coordinate.x)
            .attr("y2", line_coordinate.y)
            .attr("stroke","black");
        svg.append("text")
            .attr("x", label_coordinate.x)
            .attr("y", label_coordinate.y + 5)
            .style("text-anchor", "middle")
            .style("font-size", (isOriginal) ? "small" : "x-small")
            .text(ft_name);
    }
    // Drawing the line for the spider chart
    let line = d3.line().x(d => d.x).y(d => d.y);

    // Get coordinates for a data point
    var getPathCoordinates = (d) => {
        let coordinates = [];
        for (var i = 0; i < features.length; i++){
            let ft_name = features[i];
            let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
            coordinates.push(angleToCoordinate(angle, d[ft_name]));
        }
        return coordinates;
    };

    for (var i = 0; i < data.length; i ++){
        let d = data[i];
        let color = colors[i + color_index];
        d["Color"] = color_index;
        let coordinates = getPathCoordinates(d);

        // Draw the path element
        svg.append("path")
            .datum(coordinates)
            .attr("d",line)
            .attr("stroke-width", 3)
            .attr("stroke", color)
            .attr("fill", color)
            .attr("stroke-opacity", 1)
            .attr("opacity", 0.35);
    }

    if(isOriginal) {
        addLegend(svg, data, top_margin, isOriginal);
    } else {
        addSubtitle(svg, evolCategories[data[0]["Evolution"]]);
    }
}

function addSubtitle(svg, subtitle) {
    svg.append("text")
        .attr("x", 80)
        .attr("y", 180)
        .style("text-anchor", "middle")
        .text(subtitle);
}

/**
 * Function avgDataByColumn: Calculates the averages for a set of columns by the unique values of one column in the dataset
 * @param data Object[] The list of objects representing the read CSV file
 * @param colsToAvg string[] The columns whose averages will be calculated by grouping of the unique values of the byCol column
 * @param byCol string The column whose unique values will be the groups for the colsToAvg column averages
 *
 * @return Object[] list of objects containing each unique byCol value with their corresponding colsToAvg column averages
 */
function avgDataByColumn(data, colsToAvg, byCol) {
    var uniqueByColVals = [];   // Saves the unique byCol column values as they are discovered
    var sumObjs = [];           // List of summation objects for each unique byCol column value

    // Loop through each row of the provided dataset argument
    data.forEach((data_item, data_idx) => {
        var byColVal = +data_item[byCol];
        if (!uniqueByColVals.includes(byColVal)) {
            // If found a new byCol column value, initialize object for summation
            let obj = new Object();
            obj[byCol + "_val"] = byColVal;
            obj["count"] = 0;

            // Initialize sum properties for the colsToAvg columns
            colsToAvg.forEach((item, index) => {
                obj[item + "_sum"] = 0;
            });

            // Push the summation object and the new byCol column value into their appropriate list variables for future checking
            sumObjs.push(obj);
            uniqueByColVals.push(byColVal);
        }

        // Retrieve the summation object for the current byCol column value
        var sumObj = sumObjs.find(x => {
            return x[byCol + "_val"] == byColVal;
        });

        // Foreach of the colsToAvg columns in the dataset, add their value to the corresponding sum properties in the summation object
        colsToAvg.forEach((col_item, col_idx) => {
            sumObj[col_item + "_sum"] += +data_item[col_item];
        });

        // Increase the counter for this specific summation object (ie. summation object for the current byCol value)
        sumObj["count"] += 1;
    });

    var avgObjs = [];   // List of objects with the desired averages for each unique byCol column value

    // Loop through each of the summation objects
    sumObjs.forEach((sum_item, sum_idx) => {

        // Create new object that will contained the desired averages for the current summation object + byCol column value
        var avgObj = new Object();
        avgObj[byCol] = sum_item[byCol + "_val"];

        // Divide each of the sum properties corresponding to the colsToAvg columns by the counter of the summation object to get the desired averages
        colsToAvg.forEach((col_item, col_idx) => {
            avgObj[col_item] = Math.round((sum_item[col_item + "_sum"] / sum_item["count"]) * 100) / 100;
        });

        // push the above object to the appropriate list
        avgObjs.push(avgObj);
    });

    // return the list of objects containing the desired averages for the colsToAvg columns grouped by each unique byCol column value
    return avgObjs;
}