/**
 * Function loadHeatMap: Renders the heat map into a specified SVG container
 */
function loadHeatMap(svg, height, width, base_data, top_margin, bottom_margin, left_margin) {
    var tooltipDiv = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var extra_bottom_margin = 50;
    var excess_top_margin = 30;

    var onlyUnique = (value, index, self) => {
        return self.indexOf(value) === index;
    };

    var type1 = base_data.map(a => a["Type 1"]);
    var type2 = base_data.map(a => a["Type 2"]);

    var allTypes = type1.concat(type2);
    allTypes = allTypes.filter(onlyUnique);
    allTypes = allTypes.sort((a, b) => {
        if (a < b)
            return -1;

        if (b > a)
            return 1;

        return 0;
    });

    var allTypesNoEmptyType = allTypes.slice(0);
    allTypesNoEmptyType.shift();

    // Build X scales and axis:
    var x = d3.scaleBand()
        .range([ left_margin, width * 0.95 ])
        .domain(allTypes)
        .padding(0.01);
    svg.append("g")
        .attr("transform", "translate(0," + (height - (bottom_margin + extra_bottom_margin)) + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("y", 12)
        .attr("x", 5)
        .attr("dy", ".35em")
        .attr("transform", "rotate(-30)")
        .style("text-anchor", "end")
        .text(function(d, i) {
            if (d === "")
                return "None";
            else
                return d;
        });

    // Build Y scales and axis:
    var y = d3.scaleBand()
        .range([ height - (bottom_margin + extra_bottom_margin), top_margin - excess_top_margin ])
        .domain(allTypes)
        .padding(0.01);
    svg.append("g")
        .attr("transform", "translate(" + left_margin + ", 0)")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .text(function(d, i) {
            if (d === "")
                return "None";
            else
                return d;
        });

    var data = setupHeatMapData(allTypes, base_data);

    var avgList = data.map(a => +a["Special Stats Avg"]);
    var maxAvg = Math.max.apply(null, avgList);
    maxAvg = Math.ceil(maxAvg);

    // Build color scale
    var myColor = d3.scaleLinear()
        .range(["rgb(195, 188, 188)", "rgb(105, 255, 219)"])
        .domain([0, maxAvg]);


    var curr_selection;

    // Add the squares
    svg.selectAll()
        .data(data, function(d) {return d["Type 1"]+':'+d["Type 2"];})
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d["Type 1"]) })
        .attr("y", function(d) { return y(d["Type 2"]) })
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .attr("stroke", "rgb(135,128,128)")
        .style("fill", function(d) { return myColor(d["Special Stats Avg"])} )
        .on("mouseover", function(d) {
            tooltipDiv.transition()
                .duration(200)
                .style("opacity", .9);

            let type = "", t1 = d["Type 1"], t2 = d["Type 2"]
            if (t1) {
                type += t1;

                if (t2) {
                    if (t1 !== t2)
                        type += " & " + d["Type 2"];
                    else
                        type = "N/A";
                }
            }
            else {
                if (t2)
                    type += t2;
                else
                    type = "N/A"
            }

            let tooltipStr = type === "N/A" ? "Axis of Reflection" : "Type: " + type + "<br/>Total Average Special Stats: " + d["Special Stats Avg"];
            tooltipDiv.html(tooltipStr)
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY + 5) + "px");
        })
        .on('mouseout', function(d){
            // Removing the tooltip when the moused out

            // Code adapted from http://bl.ocks.org/d3noob/a22c42db65eb00d4e369
            tooltipDiv.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on('click', function(d) {
            if (d["Special Stats Avg"] > 0) {
                let pcPathClasses = ".pc_line";
                let t1 = d["Type 1"], t2 = d["Type 2"];

                var arrDiff = (arr1, arr2) => {
                    return arr1.filter(x => !arr2.includes(x));
                }

                var generateSelectorForSingleType = (typeStr) => {
                    pcPathClasses += "." + typeStr;
                    let otherTypes = arrDiff(allTypesNoEmptyType, [typeStr]);
                    otherTypes.forEach((val, idx) => {
                        pcPathClasses += ":not(." + val + ")"
                    })
                }

                if (t1 && !t2) {
                    generateSelectorForSingleType(t1);
                }
                else if (!t1 && t2) {
                    generateSelectorForSingleType(t2);
                }
                else {
                    pcPathClasses += "." + t1 + "." + t2;
                }

                let pc_paths_match = d3.select(".foreground").selectAll(pcPathClasses);

                if ((pc_paths_match !== undefined)&&(pc_paths_match._groups[0][0] !== null)) {
                    let select = (elem) => {
                        pc_paths_match.classed("hm_match", true);

                        let pc_paths_disabled = d3.select(".foreground").selectAll(".pc_line:not(.hm_match)");

                        let cssTextStr = elem.style.cssText;
                        let fillSubStr = cssTextStr.substring(
                            cssTextStr.lastIndexOf(":") + 2,
                            cssTextStr.lastIndexOf(";")
                        );

                        let init_state = {
                            elem: elem,
                            fill: fillSubStr,
                            pcMatchedPaths: pc_paths_match,
                            pcDisabledPaths: pc_paths_disabled,
                            selected: true
                        }

                        curr_selection = init_state;

                        let rgb = fillSubStr.match(/\d+/g).map(Number);

                        let newRgbStr = "rgb(" + rgb[0] + ", " + (rgb[1] - 150) + ", " + rgb[2] + ")";
                        console.log(newRgbStr);
                        elem.style.fill = newRgbStr;
                        pc_paths_disabled.style("display", "none");

                        let pc_selection_check = d3.select(".foreground").select(".pc_selected").node();
                        if (pc_selection_check && !(pc_paths_match.nodes().includes(pc_selection_check))) {
                            onResetClicked();
                        }
                    };

                    // If there is a current selection, disable that selection first
                    if (curr_selection) {
                        curr_selection.elem.style.fill = curr_selection.fill;
                        curr_selection.pcDisabledPaths.style("display", "block");
                        curr_selection.pcMatchedPaths.classed("hm_match", false);

                        if (curr_selection.elem !== this) {
                            select(this);
                        }
                        else {
                            curr_selection = undefined;
                        }
                    }
                    else {
                        select(this);
                    }
                }
            }

        });

    // Append a defs (for definition) element to the SVG
    var defs = svg.append("defs");

    // Append a linearGradient element to the defs
    var linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

    // Set the color for the start (0%)
    linearGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "rgb(195, 188, 188)");

    // Set the color for the end (100%)
    linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "rgb(105, 255, 219)");

    var center_point = (width/2);

    // Draw the rectangle and fill with gradient
    svg.append("rect")
        .attr("width", 300)
        .attr("height", 20)
        .style("fill", "url(#linear-gradient)")
        .attr("transform", "translate(" + (center_point-150) + "," + (height - bottom_margin - 10) + ")");

    // Gradient legend minimum value label
    svg.append("text")
        .attr("transform", "translate(" + ((center_point-150)-10) + " ," + (height - bottom_margin + 5) + ")")
        .attr("font-weight", "bold")
        .style("text-anchor", "end")
        .text("0");

    // Gradient legend maximum value label
    svg.append("text")
        .attr("transform", "translate(" + ((center_point+150)+10) + " ," + (height - bottom_margin + 5) + ")")
        .attr("font-weight", "bold")
        .style("text-anchor", "start")
        .text(maxAvg);
}

/**
 * Function setupHeatMapData: Sets up and returns the appropriate data needed for the heat map
 * @param types string[] The different Pokemon types that will be both the x and y axis
 * @param data Object[] The list of objects representing the read CSV file
 *
 * @return Object[] the list of different Pokemon type pairings with their respective special stats total and averages
 */
function setupHeatMapData(types, data) {
    var retArr = [];    // the return list/array

    // Push all possible type pairings as objects into the return array, each with special stats total and counter properties initialized to 0
    types.forEach((type_item1, type_idx1) => {
        types.forEach((type_item2, type_idx2) => {
            let obj = new Object();
            obj["Type 1"] = type_item1;
            obj["Type 2"] = type_item2;
            obj["Special Stats Total"] = 0;
            obj["Count"] = 0;
            retArr.push(obj);
        })
    })

    // Loop through each row of the provided dataset argument
    data.forEach((data_item, data_idx) => {
        // Grab the two pairings for the current data row (ie. current Pokemon)
        let type1 = data_item["Type 1"];
        let type2 = data_item["Type 2"];

        // Retrieve the symmetric pairings (from the return array) that matches the current data row's two types
        let matches = retArr.filter(x => {
            return (x["Type 1"] == type1 && x["Type 2"] == type2)||(x["Type 1"] == type2 && x["Type 2"] == type1);
        })

        // Add the sum of the special defense and special attack columns of the current data row to the symmetric pairings special stats total property,
        // then increment their counters by 1
        matches.forEach((match_item, match_idx) => {
            match_item["Special Stats Total"] += (+data_item["Sp. Atk"] + +data_item["Sp. Def"]);
            match_item["Count"] += 1;
        })
    })

    // Loop through the return array
    retArr.forEach((ra_item, ra_idx) => {
        // If the current pairing was found from the dataset, obtain the average by dividing the special stats total by the counter
        // and save this to a new special stats average property
        if (ra_item["Count"] > 0) {
            ra_item["Special Stats Avg"] = Math.round((ra_item["Special Stats Total"] / ra_item["Count"]) * 100) / 100;
        }
        // Otherwise, if the pairing was not found from the dataset, initialize its special stats average property to 0
        else {
            ra_item["Special Stats Avg"] = 0;
        }
    })

    return retArr;
}