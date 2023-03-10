class StackedAreaChart {

  /**
   * Class constructor with basic chart configuration
   * @param {Array}
   */
  constructor( _data) {
    this.margin = {top: 20, right: 40, bottom: 60, left: 40};
    this.width = 1200 - this.margin.left - this.margin.right;
    this.height = 800 - this.margin.top - this.margin.bottom;
    this.displayType = 'Bar';
    this.data = _data;
    this.initVis();
  }
  
  /**
   * Initialize scales/axes and append static chart elements
   */
  initVis() {
    let vis = this;


    // Select HTML tag, add a SVG, and set the attributes
    // TO DO
    vis.svg = d3.select("#bar-chart")
    .append("svg")
      .attr("width", 1200)
      .attr("height", 800)
    .append("g")
    .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    // Create scales for x and y axis
    // TO DO
    vis.xScaleFocus = d3.scaleBand()
      .domain(vis.data.map(d => d.State))
      .range([0, vis.width])
      .paddingInner(0.05);
    
    vis.yScaleFocus = d3.scaleLinear()
      .domain([0, d3.max(vis.data, d => d.total)])
      .range([vis.height, 0]);



    // Create x and y axis, create two groups for x and y axis, and add these groups in SVG
    // TO DO
    vis.xAxis = d3.axisBottom(vis.xScaleFocus).tickSizeOuter(0);
    vis.xAxisG = vis.svg.append("g")
      .attr('class', 'axis x-axis')
      .attr("transform", "translate(" + vis.margin.left + "," + vis.height + ")")
      .call(vis.xAxis);
    
    vis.yAxis = d3.axisLeft(vis.yScaleFocus).tickSizeOuter(0);
    vis.yAxisG = vis.svg.append("g")
      .attr('class', 'axis y-axis')
      .attr("transform", "translate(" + vis.margin.left + "," + 0 + ")")
      .call(vis.yAxis);

    // Add y label to the chart

    vis.svg.append("text")
           .attr("class", "ylabel")
           .attr("y", 0 - vis.margin.left+30)
           .attr("x", 0 - (vis.height/120))
           .attr("dy", "1em")
           .attr("transform", "rotate(0)")
           .style("text-anchor", "middle")
           .text("Population");

    // Get the population under different age categories and assign color

    vis.subgroups = vis.data.columns.slice(1);
    
    vis.colorScale = d3.scaleOrdinal()
                       .range(["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3","#fdb462","#b3de69"])
                       .domain(vis.subgroups);
    // color is represented by hex value (a link for the relationship among different color representations)
    // https://imagecolorpicker.com/color-code 
    // Feel free to use your own color set



    // Get stacked data and sort 
    // Hint: the following functions will be used during implementing this part: 
    //map() and sort() functions in array and d3.stack() for stacked bar chart
    // TO DO
    vis.groups = vis.data.map(d => (d.State));
    vis.stackedData = d3.stack().keys(vis.subgroups)(vis.data);
    vis.sorted_data = vis.data.slice().sort(function(record1, record2) {
      return record1.total < record2.total;
    });
    vis.sorted_groups = vis.sorted_data.map(d => (d.State));
    vis.sorted_stackedData = d3.stack().keys(vis.subgroups)(vis.sorted_data);
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis(){
        let vis = this;

        if (vis.displayType == 'Sorted'){
             vis.xScaleFocus.domain(vis.sorted_groups);
             // sorted_groups is a set of states after sorting by total population
        }
        else {
            vis.xScaleFocus.domain(vis.groups); 
            // groups is a set of states without sorting
        }
        vis.yScaleFocus.domain([0, d3.max(vis.data, d => d.total)]);

        vis.renderVis(); 
  }

  /**
   * This function contains the D3 code for binding data to visual elements
   * Important: the chart is not interactive yet and renderVis() is intended
   * to be called only once; otherwise new paths would be added on top
   */
  renderVis(){
        let vis = this;

        vis.svg.selectAll("rect").remove();
        vis.svg.selectAll(".legendtext").remove();

        if (vis.displayType == 'Bar') {
            // Visualzie Bar Chart
            // TO DO
            vis.svg.append("g")
              .selectAll("rect")
              .data(vis.data)
              .join("rect")
                .attr("x", d => vis.xScaleFocus(d.State) + vis.margin.left)
                .attr("y", d => vis.yScaleFocus(d.total))
                .attr("height", d => vis.height - vis.yScaleFocus(d.total))
                .attr("width",vis.xScaleFocus.bandwidth())
                .attr('fill', "#8dd3c7");
        }
        else if (vis.displayType=='Stacked') {
            // Visualize Stacked Bar Chart
            // TO DO
            vis.svg.append("g")
              .selectAll("g")
              .data(vis.stackedData)
              .join("g")
                .attr("fill", d => vis.colorScale(d.key))
                .selectAll("rect")
                .data(d => d)
                .join("rect")
                  .attr("x", d => vis.xScaleFocus(d.data.State) + vis.margin.left)
                  .attr("y", d => vis.yScaleFocus(d[1]))
                  .attr("height", d => vis.yScaleFocus(d[0]) - vis.yScaleFocus(d[1]))
                  .attr("width", vis.xScaleFocus.bandwidth());
        }
        else if (vis.displayType=='Sorted') {

            // Visualize Sorted Stacked Bar Chart
            // TO DO
            vis.svg.append("g")
              .selectAll("g")
              .data(vis.sorted_stackedData)
              .join("g")
                .attr("fill", d => vis.colorScale(d.key))
                .selectAll("rect")
                .data(d => d)
                .join("rect")
                  .attr("x", d => vis.xScaleFocus(d.data.State) + vis.margin.left)
                  .attr("y", d => vis.yScaleFocus(d[1]))
                  .attr("height", d => vis.yScaleFocus(d[0]) - vis.yScaleFocus(d[1]))
                  .attr("width",vis.xScaleFocus.bandwidth());
        }     

        vis.xAxisG.call(vis.xAxis);
        vis.yAxisG.call(vis.yAxis);


        // Display or remove legend 
        //TO DO
        if (vis.displayType=='Stacked' || vis.displayType=='Sorted') {
            vis.re_subgroups = vis.subgroups.slice().reverse()
            vis.svg.selectAll(".legend")
			        .data(vis.re_subgroups)
			        .join("rect")
			          .attr("class", "legend")
			          .attr("x", vis.width + 15)  
				        .attr("y", function(d,i) {return i*20 + vis.margin.top;})
                .attr("width", 15)
                .attr("height", 15)
                .style("fill", d => vis.colorScale(d));

            vis.svg.selectAll(".legendtext")
                .data(vis.re_subgroups)
                .join("text")
                  .attr("class", "legendtext")
                  .attr("x", vis.width)
                  .attr("y", function(d,i){return i*20 + vis.margin.top + 10;})
                  .style("fill", "black")
                  .text(d => d)
                  .attr("text-anchor", "end")
                  .style("alignment-baseline", "middle");
        } 
    }
}