
// The code for the chart is wrapped inside a function that
// automatically resizes the chart
function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");
  
    // clear svg is not empty
    if (!svgArea.empty()) {
      svgArea.remove();
    }
  
    // SVG wrapper dimensions are determined by the current width and
    // height of the browser window but divide by 2.
    var svgHeight = window.innerHeight/2;
    var svgWidth = window.innerWidth/2;
    console.log(svgHeight)
    console.log(svgWidth)

    var margin = {
      top: 20,
      right: 40,
      bottom: 100,
      left: 100
    };
    
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;
    
    // Create an SVG wrapper, append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.
    var svg = d3
      .select("#scatter")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight);
    
    // Append an SVG group
    var chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    // Initial Params
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";
    
    // function used for updating x-scale var upon click on axis label
    function xScale(censusdata, chosenXAxis) {
      // create scales
      var xLinearScale = d3.scaleLinear()
        .domain([d3.min(censusdata, d => d[chosenXAxis]) * 0.8,
          d3.max(censusdata, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, width]);
    
      return xLinearScale;
    
    }

    // function used for updating y-scale var upon click on axis label
    function yScale(censusdata, chosenYAxis) {
        // create scales
        var yLinearScale = d3.scaleLinear()
          .domain([d3.min(censusdata, d => d[chosenYAxis]) * 0.8,
            d3.max(censusdata, d => d[chosenYAxis]) * 1.2
          ])
          .range([height, 0]);
      
        return yLinearScale;
      
    }
    
    // function used for updating xAxis var upon click on axis label
    function renderXAxes(newXScale, xAxis) {
      var bottomAxis = d3.axisBottom(newXScale);
    
      xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
      return xAxis;
    }

     // function used for updating yAxis var upon click on axis label
    function renderYAxes(newYScale, yAxis) {
       var leftAxis = d3.axisLeft(newYScale);
      
       yAxis.transition()
          .duration(1000)
          .call(leftAxis);
      
        return yAxis;
    }
         
    
    // function used for updating circles group with a transition to
    // new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    
      circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    
      return circlesGroup;
    }

    // function used for updating circles text group with a transition to
    // new circles
    function renderText(textGroup, newXScale, newYScale,chosenXAxis,chosenYAxis) {

        textGroup.transition()
          .duration(1000)
          .attr("x", d => newXScale(d[chosenXAxis]))
          .attr("y", d => newYScale(d[chosenYAxis]*.97));
          
        
        return textGroup;
    }
    
    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    
      var label;
      var ylabel;
    
      if (chosenXAxis === "poverty") {
        label = "Poverty:";
      }
      else if (chosenXAxis === "age") {
        label = "Age (Median):";
      }
      else {
        label = "Household Income (Median)";
      }
      if (chosenYAxis === "healthcare") {
        ylabel = "Lacks Healthcare:";
      }
      else if (chosenYAxis === "smokes") {
        ylabel = "Smokes:";
      }
      else {
        ylabel = "Obese:";
      }
    
      var toolTip = d3.tip()
        .attr("class", "tooltip d3-tip")
        .offset([80, -60])
        .html(function(d) { 
          if (chosenXAxis === "poverty") {
           return (`${d.state}<br>${label} ${d[chosenXAxis] + "%"}<br>${ylabel} ${d[chosenYAxis] + "%"}`); //add in % sign if needed
          }
          else {
           return (`${d.state}<br>${label} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis] + "%"}`);
        }
        });
    
      circlesGroup.call(toolTip);
    
      circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
      })
        // onmouseout event
        .on("mouseout", function(data) {
          toolTip.hide(data);
        });
    
      return circlesGroup;
    }
    
    // Retrieve data from the CSV file and execute everything below
    d3.csv("assets/data/data.csv").then(function(censusdata, err) {
      if (err) throw err;
    
      // parse data
      censusdata.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.obesity = +data.obesity;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.smokes = +data.smokes;
        data.abbr = data.abbr;

      });
    
      // xLinearScale function above csv import
      // yLinearScale function above csv import
      var xLinearScale = xScale(censusdata, chosenXAxis);
      var yLinearScale = yScale(censusdata, chosenYAxis);
    
      // Create initial axis functions
      var bottomAxis = d3.axisBottom(xLinearScale);
      var leftAxis = d3.axisLeft(yLinearScale);
    
      // append x axis
      var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
      // append y axis
      var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);
    
      // append initial circles
      var circlesGroup = chartGroup.selectAll(".circle")
        .data(censusdata)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 16)
        .attr("opacity", ".95")
        .attr("class","stateCircle");
    
    // append initial text
       var textGroup = chartGroup.selectAll("text")
        .exit() //because enter() before, clear cache
        .data(censusdata)
        .enter()
        .append("text")
        .text(d => d.abbr)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]*0.97))
        .attr("class","stateText");

      // Create group for three x-axis labels
      var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
      var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")// value to grab for event listener
        .classed("active", true)
        .text("In Poverty(%)");
    
      var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")// value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

      var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")// value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");        

      // Create group for three y-axis labels    
      var ylabelsGroup = chartGroup.append("g")

      // append y axis
      var healthcareLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 60 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "healthcare")
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("active", true)
        .text("Lacks Healthcare (%)");

      var smokesLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 30 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "smokes")
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("inactive", true)
        .text("Smokes (%)");
    
      var obesityLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "obesity")
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("inactive", true)
        .text("Obese (%)");

      // updateToolTip function above csv import
      var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    
      // x axis labels event listener
      labelsGroup.selectAll("text")
        .on("click", function() {
          // get value of selection
          var value = d3.select(this).attr("value");
          if (value !== chosenXAxis) {
    
            // replaces chosenXAxis with value
            chosenXAxis = value;
    
            //console.log(chosenXAxis)
    
            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(censusdata, chosenXAxis);
            // updates x axis with transition
            xAxis = renderXAxes(xLinearScale, xAxis);
    
            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            textGroup = renderText(textGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);
    
            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    
            // changes classes to change bold text
            if (chosenXAxis === "poverty") {
               povertyLabel
                .classed("active", true)
                .classed("inactive", false);
               ageLabel
                .classed("active", false)
                .classed("inactive", true);
               incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenXAxis === "age") {
                povertyLabel
                 .classed("active", false)
                 .classed("inactive", true);
                ageLabel
                 .classed("active", true)
                 .classed("inactive", false);
                incomeLabel
                 .classed("active", false)
                 .classed("inactive", true);     
            }       
            else {
                povertyLabel
                 .classed("active", false)
                 .classed("inactive", true);
                ageLabel
                 .classed("active", false)
                 .classed("inactive", true);
                incomeLabel
                 .classed("active", true)
                 .classed("inactive", false);  
            }
          }
        });

      // y axis labels event listener
      ylabelsGroup.selectAll("text")
        .on("click", function() {
          // get value of selection
          var value = d3.select(this).attr("value");
          if (value !== chosenYAxis) {
    
            // replaces chosenYAxis with value
            chosenYAxis = value;
    
    
            // functions here found above csv import
            // updates x scale for new data
            yLinearScale = yScale(censusdata, chosenYAxis);
    
            // updates y axis with transition
            yAxis = renderYAxes(yLinearScale, yAxis);
    
            // updates circles with new y values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            textGroup = renderText(textGroup, xLinearScale,yLinearScale,chosenXAxis,chosenYAxis);
    
            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    
            // changes classes to change bold text
            if (chosenYAxis === "healthcare") {
               healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
               smokesLabel
                .classed("active", false)
                .classed("inactive", true);
               obesityLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            else if (chosenYAxis === "smokes") {
                healthcareLabel
                 .classed("active", false)
                 .classed("inactive", true);
                smokesLabel
                 .classed("active", true)
                 .classed("inactive", false);
                obesityLabel
                 .classed("active", false)
                 .classed("inactive", true);     
            }       
            else {
                healthcareLabel
                 .classed("active", false)
                 .classed("inactive", true);
                smokesLabel
                 .classed("active", false)
                 .classed("inactive", true);
                obesityLabel
                 .classed("active", true)
                 .classed("inactive", false);  
            }
          }
        });
    }).catch(function(error) {
      console.log(error);
    });
 
}

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);