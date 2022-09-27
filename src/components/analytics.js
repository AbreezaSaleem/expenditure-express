import { useState, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import union from 'lodash.union';
import max from 'lodash.max';
import { Box, Spinner, Heading } from 'grommet';
import * as d3 from 'd3';
import { Popup } from '../components';

// show data and analytics on hover

const getData = (expenditure) => {
  
  /**
   * get subgroups
   * user can add different types of expenditures in his csv files
   * in one year he might have spent on 'travel' and in another he might not have
   * so for different years we can expect different types of expenditures
   * keeping this in mind, we need to make sure we pass ALL the types of expenditures
   * to our x-axis sub-group domain
   */
  /**
   * while you're doing this computation, you can also compute the maximum expenditure
   * so you can properly set the y-axis range from 0 to maxExpenditure
   */
  const subgroups = Object.values(expenditure).map(obj => Object.keys(obj.analytics) );
  const yRange = Object.values(expenditure).map(obj => Object.values(obj.analytics));
  return {
    groups: Object.keys(expenditure),
    subgroups: union(...subgroups),
    yRange: union(...yRange),
    data: Object.keys(expenditure).map(year => (
      {
        group: year,
        ...expenditure[year].analytics,
      }
    ))
  }
};

export const Analytics = () => {
  const queryClient = useQueryClient()
  const files = queryClient.getQueryData('expendituresFiles')
  const [open, setOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  console.log('files',files, getData(files))

  const { data, groups, subgroups, yRange } = getData(files);

  const onOpen = () => setOpen(true);
  const onClose = () => {
    setOpen(false);
    setShowCart(false);
  }

  const defineChartDimensions = () => {
    const margin = {top: 10, right: 50, bottom: 20, left: 50};
    const element = document.getElementById('chart-wrapper');
    const computedStyle = getComputedStyle(element);
    let width = element.clientWidth;   // width with padding
    width -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);
    const height = 400 - margin.top - margin.bottom;
    const parentWidth = document.getElementById('chart-wrapper').offsetWidth;
    const chartWidth = width * .9;
    const legendWidth = width * .095;
    // console.log('width', parentWidth, width, chartWidth, legendWidth, chartWidth+legendWidth);
    return { height, parentWidth, chartWidth, legendWidth, margin };
  }

  const createChartSvg = (width, height, margin) => {
    // append the svg object to the body of the page
    const svg = d3.select("#my_dataviz")
    .append("svg")
      .attr("width", (width))
      .attr("height", height + margin.top + margin.bottom)
      .style("border", "1px solid lightgrey")
    svg.append("g")
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
    return svg;
  }

  const addXAxis = (svg, groups, width, height) => {
    // Add X axis
    let x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding([0.2])
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .attr("class", "x-axis")
      .call(d3.axisBottom(x));
    return x;
  };

  const addYAxis = (svg, yRange, height) => {
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return d3.max(yRange) })]).nice()
      .range([ height, 0 ]);
    svg.append("g")
      .attr("transform", "translate(30,10)")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("x", 5)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text("Expenditure");
    return y;
  };

  const addSubXAxis = (x, subgroups) => {
    const xSubgroup = d3.scaleBand()
      .domain(subgroups)
      .rangeRound([0, x.bandwidth()])
      .padding([0.05]);
    return xSubgroup;
  };

  const defineColorPalette = () => {
    const color = d3.scaleOrdinal()
      .domain(subgroups)
      .range(['#e41a1c','#377eb8','#4daf4a', '#fa6d98', '#e2e14c', '#07b1bc']) // make colors dynamic
      // .range(d3.schemeSet1) // make colors dynamic
    return color;
  };

  const generateBars = (svg, xSubgroup, x, y, height, color) => {
    svg.append("g")
      .selectAll("g")
      // Enter in data = loop group per group
      .data(data)
      .enter()
      .append("g")
        .attr("class", "barGroup")
        .attr("transform", function(d) { return "translate(" + x(d.group) + ",0)"; })
      .selectAll("rect")
      .data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key]}; }); })
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return xSubgroup(d.key); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", xSubgroup.bandwidth())
        .attr("height", function(d) { return height - y(d.value); })
        .attr("fill", function(d) { return color(d.key); })
  };

  // shameless got code from here https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2
  const showDataOnHover = (svg) => {
    const div = d3.select("body").append("div")
      .attr("class", "svg1-tooltip")

    svg.selectAll("rect")
      //Our new hover effects
    .on('mouseover', function (event, d) {
        d3.select(this).transition()
          .duration('50')
          .attr('opacity', '.85')
          .attr('cursor', 'pointer');
        div.html(`${d.value}, ${d.key}`)
          .transition().duration(50)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 15) + "px")
          .style("visibility", 'visible');
      })
      .on('mouseout', function (event, d) {
        d3.select(this).transition()
          .duration('50')
          .attr('opacity', '1')
          .attr('cursor', 'default');
        div.transition()
          .duration('50')
          .style("visibility", 'hidden');
      });
  }

  const createLegends = (height, width, margin, color) => {
    const xCoord = width * .12;
    const yCoord = xCoord + (height * .3);
    const svg_legend = d3.select("#chart_legends")
    .append("svg")
      .attr("width", (width))
      .attr("height", height + margin.top + margin.bottom)
      .style("border", "1px solid lightgrey")

    const size = 10
    svg_legend.selectAll("mydots")
      .data(subgroups)
      .enter()
      .append("rect")
        .attr("x", xCoord)
        .attr("y", function(d,i){ return yCoord + i*(size+10)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return color(d)})
    
    // Add one dot in the legend for each name.
    svg_legend.selectAll("mylabels")
      .data(subgroups)
      .enter()
      .append("text")
        .attr("x", xCoord + size*1.2)
        .attr("y", function(d,i){ return yCoord + i*(size+10) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", '#363535')
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("font-weight", "bold")
        .style("font-size", "15px")
  };

  // zooming functionality taken from here https://stackoverflow.com/a/49286715/6051241
  const zoomChart = (svg, margin, x, xSubgroup, width, height) => {
    const extent = [[margin.left, margin.top], [width - margin.right, height - margin.top]];

    svg.call(d3.zoom()
        .scaleExtent([1, 4])
        .translateExtent(extent)
        .extent(extent)
        .on("zoom", zoomed));

    function zoomed(event) {
      // if event.transform.k === 4 then you start showing months...

      /**
       * basically, you wipe out data from 'bar-group' and 'bar' class and re-render it with new data
       * bar-group will now be month and 'bar' will contain monthly data
       * a new x-Axis domain will be needed
       * xSubgroup will remain the same
       * there should be a smooth transition between year data and month data
       */

      if (event.transform.k === 4) {

      }

      x.range([0, width].map(d => event.transform.applyX(d)));
      xSubgroup.rangeRound([0, x.bandwidth()]);

      svg.selectAll(".barGroup").attr("transform", function(d) { return "translate(" + x(d.group) + ",0)"; });
      svg.selectAll(".bar").attr("x", function(d) { return xSubgroup(d.key); }).attr("width", xSubgroup.bandwidth());
    
      svg.select(".x-axis").call(d3.axisBottom(x));
    }
  };

  // shamelessly got code from here https://d3-graph-gallery.com/graph/barplot_grouped_basicWide.html
  const renderChart = () => {
    // set the dimensions and margins of the graph
    const { height, chartWidth, legendWidth, margin } = defineChartDimensions();

    // append the svg object to the body of the page
    const svg = createChartSvg(chartWidth, height, margin);

    // add the x Axis
    const x = addXAxis(svg, groups, chartWidth, height);

    // Add Y axis
    const y = addYAxis(svg, yRange, height);

    // Another axis for subgroup position
    const xSubgroup = addSubXAxis(x, subgroups);

    // color palette = one color per subgroup
    const color = defineColorPalette();

    // Show the bars
    generateBars(svg, xSubgroup, x, y, height, color);

    // Show data on hover
    showDataOnHover(svg);

    // Create legend
    // Add one dot in the legend for each name.
    createLegends(height, legendWidth, margin, color);

    // add zoom
    zoomChart(svg, margin, x, xSubgroup, chartWidth, height);
  };

  useEffect(() => {
    if (open) { setTimeout(() => { setShowCart(true); }, 1000); }
  }, [open]);

  return (
    <>
    <Box onClick={onOpen} pad="none" align="center" justify="start">
      <Heading level={4}>View Analytics 📊</Heading>
    </Box>
    <Popup
      open={ open }
      onClose={ onClose }
      heading="Expenditure vs Time"
      allowClose
      full
    >
      <Box id="chart-wrapper" margin="small" align="center" direction="row" overflow="scroll" background="whitesmoke">
        <div id="my_dataviz"></div>
        <div id="chart_legends"></div>
      </Box>
      { showCart ? renderChart() : <Spinner color="neutral-1" /> }
    </Popup>
    </>
  );
}
