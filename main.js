/**
 * Lawrence Manzano
 * UCID: 10170563
 *
 * References:
 * https://www.d3-graph-gallery.com/graph/parallel_basic.html
 * https://yangdanny97.github.io/blog/2019/03/01/D3-Spider-Chart
 * https://www.d3-graph-gallery.com/graph/heatmap_basic.html
 */

//Call our functions on window load event
window.onload = function(){
    setup();
};

//global variables
var svg_list = [];          // the svg containers where we will draw our visualizations
var svg_width_list = [];    // the widths of the svg containers
var svg_height_list = [];   // the heights of the svg containers

var base_data;              // the unmodified dataset extracted from the CSV file

var left_margin = 70;       // the left margin for charts (i.e. the left boundary of the visual within the container)
var bottom_margin = 30;     // the bottom margin for the charts (i.e. the bottom boundary of the visual within the container)
var top_margin = 50;        // the top margin for the charts (i.e. the upper boundary of the visual within the container)

/**
 * Function setup: sets up our visualization environment.
 */
function setup(){
    // String IDs of the 3 SVG containers
    var svgIdList = ["vis1", "vis2", "vis3"];

    // Foreach SVG container in the HTML page, save their references and dimensions into the appropriate global list variables
    for (i = 0; i < 3; i++) {
        var svgTuple = grabSvgDimensions(svgIdList[i]);
        svg_list.push(svgTuple[0]);
        svg_width_list.push(svgTuple[1]);
        svg_height_list.push(svgTuple[2]);
    }

    loadData("Pokemon-Dataset.csv");
}

/**
 * Function grabSvgDimensions: Retrieves and saves the heights and widths of an SVG element
 * @param svgID string HTML ID of the desired SVG element
 */
function grabSvgDimensions(svgID) {
    var svg = d3.select("#" + svgID);

    //grab the specified SVG container's dimensions (width and height)
    var svg_width = svg.node().getBoundingClientRect().width;
    var svg_height = svg.node().getBoundingClientRect().height;

    return [svg, svg_width, svg_height];
}

/**
 * Function loadData: loads data from a given CSV file path/url
 * @param path string location of the CSV data file
 */
function loadData(path){
    d3.csv(path).then(function(data){
        base_data = data;

        // Load the star plot, heat map and parallel coordinates chart in the first, second and third SVG container grid cells respectively

        for (i = 0; i < 3; i++) {
            let svg = svg_list[i];
            let height = svg_height_list[i];
            let width = svg_width_list[i];

            switch (i) {
                case 0:
                    loadStarPlot(svg, height, width, base_data, top_margin);
                    break;
                case 1:
                    loadHeatMap(svg, height, width, base_data, top_margin, bottom_margin, left_margin);
                    break;
                case 2:
                    loadParallelCoordinates(svg, height, width, base_data, top_margin, bottom_margin);
            }
        }
    });
}
