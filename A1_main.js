
// Initialize helper function

let data, stackedBarChart, keys;

/**
 * Load data from CSV file asynchronously and render area chart
 */
d3.csv('A1_Data.csv')
  .then(_data => {
    // get the keys from the data and compute the total population (you are required to use sum function)
    // TO DO
    keys = _data.columns.slice(1);
    _data.forEach(function(d) {
			d.total = d3.sum(keys, k => +d[k]);
			return d;
		});
    data = _data;
    // Initialize and render chart
    stackedBarChart = new StackedAreaChart(data);
    stackedBarChart.updateVis();
  });


/**
 * Select box event listener
 */

// 
d3.select('#display-type-selection').on('change', function() {
  // Get selected display type and update chart
  stackedBarChart.displayType = d3.select(this).property('value');
  stackedBarChart.updateVis();
});