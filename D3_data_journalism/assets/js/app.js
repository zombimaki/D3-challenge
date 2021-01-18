//////////////////////////////////////////////////////////////////
// declare SVG, svg dimensions, svg group and defaults
//////////////////////////////////////////////////////////////////

// set the dimensions for the SVG container
var svgWidth = 960;
var svgHeight = 600;
var margin = {top: 50, right: 150, bottom: 200, left: 100};
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// create the svg for the scatterplot
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

//Append SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// set default x and y axis 
var selectedX = "poverty";
var selectedY = "healthcare";

//////////////////////////////////////////////////////////////////////
// import csv Data
//////////////////////////////////////////////////////////////////////

d3.csv("assets/data/data.csv").then(function(stateData) {

    // send csv data to console 
    console.log(stateData)

    //////////////////////////////////////////////////////////////////
    // cast data as numbers
    //////////////////////////////////////////////////////////////////
    stateData.forEach(function(data) {
        data.poverty    = +data.poverty;
        data.healthcare = +data.healthcare;        
        data.smokes     = +data.smokes;
        data.age        = +data.age;
        data.obesity    = +data.obesity;
        data.income     = +data.income;
      });

    //////////////////////////////////////////////////////////////////
    // call x/y scale functions
    //////////////////////////////////////////////////////////////////

    var xLinearScale = xScale(stateData, selectedX);
    var yLinearScale = yScale(stateData, selectedY);


    //////////////////////////////////////////////////////////////////
    // create axis functions
    //////////////////////////////////////////////////////////////////
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //////////////////////////////////////////////////////////////////
    // append Axes to the chart
    //////////////////////////////////////////////////////////////////
    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis)
        .classed("x-axis", true);

    var yAxis = chartGroup.append("g")
        .call(leftAxis)
        .classed("y-axis", true);

    //////////////////////////////////////////////////////////////////
    // append circles
    //////////////////////////////////////////////////////////////////

    var circlesGroup = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[selectedX]))
        .attr("cy", d => yLinearScale(d[selectedY]))
        .attr("r", "10")
        .attr("opacity", ".8")
        .classed("stateCircle", true);

    //////////////////////////////////////////////////////////////////
    // populate circles with state abbreviation    
    //////////////////////////////////////////////////////////////////

    var stateGroup = chartGroup.selectAll(".stateText")
        .data(stateData)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[selectedX]))
        .attr("y", d => yLinearScale(d[selectedY]))
        .attr("dy", 3) // centers the text
        .attr("font-size", "9px")
        .text(function(d) { return d.abbr });

    //////////////////////////////////////////////////////////////////
    // call updateToolTip function
    //////////////////////////////////////////////////////////////////

    var stateGroup = updateToolTip(selectedX, selectedY, stateGroup);

    /////////////////////////////////////////////////////////////////
    // x axis label groups
    //////////////////////////////////////////////////////////////////

    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20 + margin.top})`);

    var povertyLabel = xLabelsGroup.append("text")        
        .attr("x", 0)
        .attr("y", 0)
        .attr("value", "poverty")
        .text("In Poverty (%)")
        .classed("active", true)
        .classed("aText", true);

    var ageLabel = xLabelsGroup.append("text")        
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "age")
        .text("Age (Median)")
        .classed("aText", true);

    var incomeLabel = xLabelsGroup.append("text")        
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "income")
        .text("Household Income (Median)")
        .classed("aText", true);

    /////////////////////////////////////////////////////////////////
    // y axis label groups
    //////////////////////////////////////////////////////////////////

    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${0 - margin.left/4}, ${(height/2)})`);

    var healthcareLabel = yLabelsGroup.append("text")        
        .attr("x", 0)
        .attr("y", 0 - 25)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "healthcare")
        .text("Lacks Healthcare (%)")
        .classed("active", true)
        .classed("aText", true);

    var smokesLabel = yLabelsGroup.append("text")        
        .attr("x", 0)
        .attr("y", 0 - 45)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "smokes")
        .text("Smokes (%)")
        .classed("aText", true);

    var obesityLabel = yLabelsGroup.append("text")        
        .attr("x", 0)
        .attr("y", 0 - 65)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .attr("value", "obesity")
        .text("Obesity (%)")
        .classed("aText", true);
    
    //////////////////////////////////////////////////////////////////
    // update x axis when a different x axis label is selected
    //////////////////////////////////////////////////////////////////

    xLabelsGroup.selectAll("text")
        .on("click", function() {
            var xValue = d3.select(this).attr("value");
            
            if (xValue != selectedX) {

                // update selectedX object with selected data
                selectedX = xValue;

                // update xLinearScale object with selected data
                xLinearScale = xScale(stateData, selectedX);

                // execute updateX function with selected data
                updateX(xLinearScale, xAxis);

                // execute updateCircles function with selected data
                updateCircles(circlesGroup, xLinearScale, selectedX, yLinearScale, selectedY);

                // execute updateState function with selected data
                updateState(stateGroup, xLinearScale, selectedX, yLinearScale, selectedY);

                // execute updateToolTip function with selected data
                updateToolTip(selectedX, selectedY, stateGroup);

                // update active class flag for selected label
                if (selectedX === "poverty") {
                    povertyLabel.classed("active", true).classed("inactive", false);
                    ageLabel.classed("active", false).classed("inactive", true);
                    incomeLabel.classed("active", false).classed("inactive", true);

                } else if (selectedX === "age") {
                    povertyLabel.classed("active", false).classed("inactive", true);
                    ageLabel.classed("active", true).classed("inactive", false);
                    incomeLabel.classed("active", false).classed("inactive", true);
                    
                } else {
                    povertyLabel.classed("active", false).classed("inactive", true);
                    ageLabel.classed("active", false).classed("inactive", true);
                    incomeLabel.classed("active", true).classed("inactive", false);
                }                
            }
        });
    

    //////////////////////////////////////////////////////////////////
    // update y axis when a different y axis label is selected
    //////////////////////////////////////////////////////////////////

    yLabelsGroup.selectAll("text")
        .on("click", function() {
            
            var yValue = d3.select(this).attr("value");

            if (yValue != selectedY) {

                // update selectedY object with selected data
                selectedY = yValue;

                // update yLinearScale object with selected data
                yLinearScale = yScale(stateData, selectedY);

                // update y-axis with selected data
                updateY(yLinearScale, yAxis);

                // execute updateCircles function with selected data
                updateCircles(circlesGroup, xLinearScale, selectedX, yLinearScale, selectedY);

                // execute updateState function with selected data
                updateState(stateGroup, xLinearScale, selectedX, yLinearScale, selectedY)

                // execute updateToolTip with selected data
                updateToolTip(selectedX, selectedY, stateGroup);

                // update active class flag for selected label
                if (selectedY === "obesity") {
                    obesityLabel.classed("active", true).classed("inactive", false);
                    smokesLabel.classed("active", false).classed("inactive", true);
                    healthcareLabel.classed("active", false).classed("inactive", true);

                } else if (selectedY === "smokes") {
                    obesityLabel.classed("active", false).classed("inactive", true);
                    smokesLabel.classed("active", true).classed("inactive", false);
                    healthcareLabel.classed("active", false).classed("inactive", true);

                } else {
                    obesityLabel.classed("active", false).classed("inactive", true);
                    smokesLabel.classed("active", false).classed("inactive", true);
                    healthcareLabel.classed("active", true).classed("inactive", false);
                }
            }
        });


//////////////////////////////////////////////////////////////////////
// x/y scale functions
//////////////////////////////////////////////////////////////////////

function xScale(stateData, selectedX) {

    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(stateData, d => d[selectedX]), d3.max(stateData, d => d[selectedX])])
        .range([0, width])
        .nice();

    return xLinearScale;
}

function yScale(stateData, selectedY) {

    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(stateData, d => d[selectedY]), d3.max(stateData, d => d[selectedY])])
        .range([height, 0])
        .nice();

    return yLinearScale;
}

//////////////////////////////////////////////////////////////////////
// update x and y axis functions
//////////////////////////////////////////////////////////////////////

function updateX(updatedXScale, xAxis) { 
    
    var bottomAxis = d3.axisBottom(updatedXScale);
    xAxis.transition().duration(1000).call(bottomAxis);
}

function updateY(updatedYScale, yAxis) {

    var leftAxis = d3.axisLeft(updatedYScale);
    yAxis.transition().duration(1000).call(leftAxis);
}

//////////////////////////////////////////////////////////////////////
// function to update circles with axis changes
//////////////////////////////////////////////////////////////////////

function updateCircles(circlesGroup, updatedXScale, selectedX, updatedYScale, selectedY) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", data => updatedXScale(data[selectedX]))
        .attr("cy", data => updatedYScale(data[selectedY]));
}

//////////////////////////////////////////////////////////////////////
//function for updating state labels
//////////////////////////////////////////////////////////////////////

function updateState(stateGroup, updatedXScale, selectedX, updatedYScale, selectedY) {

    stateGroup.transition()
        .duration(1000)
        .attr("x", d => updatedXScale(d[selectedX]))
        .attr("y", d => updatedYScale(d[selectedY]));
}

//////////////////////////////////////////////////////////////////////
// format x axis label values depending on data
//////////////////////////////////////////////////////////////////////

function formatX(value, selectedX) {

    xFormat = (selectedX === "poverty") ? (`${value}%`) : ((selectedX === "income") ? (`$${value}`) : (`${value}`))
    return xFormat
}

//////////////////////////////////////////////////////////////////////
// function for updating tooltips
//////////////////////////////////////////////////////////////////////
function updateToolTip(selectedX, selectedY, stateGroup) {

    var xLabel= (selectedX === "poverty") ? ("In Poverty:") : ((selectedX === "age") ? ("Age") : ("HH Income:"))
    var yLabel= (selectedY === "healthcare") ? ("Lacks Healthcare:") : ((selectedY === "obesity") ? ("Obesity:") : ("Smokes:"))
    
    // generate tooltip
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            return (`${d.state}<br>${xLabel} ${formatX(d[selectedX], selectedX)}<br>${yLabel} ${d[selectedY]}%`);
        });
        
    stateGroup.call(toolTip);

    // mouseover/mouseout event handling
    stateGroup.on("mouseover", function(data) {

        toolTip.show(data, this);

    }).on("mouseout", function(data, index) {

        toolTip.hide(data);

      });

    return stateGroup; 
}

  
}).catch(function(error) {
    console.log(error);
  });