import { useState, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import union from 'lodash.union';
import { Box, Spinner, Heading } from 'grommet';
import * as d3 from 'd3';
import { Popup } from '../components';

/**
 * Issues: 
 * 1. There's too big a difference between y values of the bars. Small bars are barely visible 
 * 2. Height is not responsive on zoom
 * 3. Add animation when transitioning from year to month?
 */

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
  const years = Object.keys(expenditure);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dataMonth = Object.keys(expenditure).map(year => (
    months
      .filter(month => expenditure[year][month]?.analytics)
      .map(month => ({ group: year, groupSecondary: month, ...expenditure[year][month]?.analytics }),
  ))).flat();
  return {
    xAxisDomainYear: years,
    xAxisDomainMonth: months,
    // xAxisDomainMonth: dataMonth.map(d => d.groupSecondary),
    subgroups: union(...subgroups),
    yRange: union(...yRange),
    dataYear: Object.keys(expenditure).map(year => (
      {
        group: year,
        ...expenditure[year].analytics,
      }
    )),
    dataMonth,
  }
};

export const Analytics = () => {
  const queryClient = useQueryClient()
  const files = queryClient.getQueryData('expendituresFiles')
  const [open, setOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  
  const { dataYear, dataMonth, xAxisDomainYear, xAxisDomainMonth, subgroups, yRange } = getData(files);
  console.log('files', getData(files))

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

  const addXAxis = (svg, xAxisDomainYear, width, height) => {
    // Add X axis
    let x = d3.scaleBand()
      .domain(xAxisDomainYear)
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

  const addYAxis = (svg, yRange, height, margin) => {
    console.log('masx', d3.max(yRange), d3.min(yRange))
    const y = d3.scaleLinear()
      .domain([0, d3.max(yRange)]).nice()
      .range([ height - margin.bottom, margin.top ]);
    svg.append("g")
      .attr("transform", "translate(30,0)")
      .attr("class", "y-axis")
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

  const updateYAxisByMonth = (svg, y, yRange, height) => {
    y.domain([0, d3.max(dataMonth, function(d) { return d3.max(yRange) })]).nice()
    .range([ height, 0 ]);
    svg.selectAll(".y-axis")
      .call(d3.axisLeft(y))
  }

  const updateYAxisByYear = (svg, y, yRange, height) => {
    y.domain([0, d3.max(dataYear, function(d) { return d3.max(yRange) })]).nice()
    .range([ height, 0 ]);
    svg.selectAll(".y-axis")
      .call(d3.axisLeft(y))
  }

  const addSecondaryXAxis = (x, xAxisDomainMonth, currentYear = 'nm') => {
    const x2 = d3.scaleBand()
    .domain(xAxisDomainMonth.map(month => `${currentYear}-${month}`))
    .range([0, x.bandwidth()])
    .padding(0);
    return x2;
  };

  const showSecondaryXAxis = (svg, x, height) => {
    const x2s = []
    const ticks = svg
      .selectAll(".barGroup")
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .attr("class",(_, i) => `x-axis-2-${i}`)
      .each((_, i) => {
        const barGroup = d3.select(`.barGroup:nth-child(${i+1})`);
        // console.log('group', barGroup.data())
        const group = barGroup.data()[0]?.group;
        const x2 = addSecondaryXAxis(x, xAxisDomainMonth, group);
        x2s.push(x2);
      });
    x2s.forEach((x2, i) =>
      svg.selectAll(`.x-axis-2-${i}`)
        .call(
          d3.axisBottom(x2)
          .tickFormat(d => d.split('-')[1])
        )
      )
    // ticks.selectAll("text").attr("transform", "rotate(-65)");
    return x2s;
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

  const generateBarsYear = (svg, x, y, height, color) => {
    updateYAxisByYear(svg, y, yRange, height);
    const xSubgroup = addSubXAxis(x, subgroups);

    svg.selectAll(".barGroup").remove();
    svg.append("g")
      .selectAll("g")
      // Enter in data = loop group per group
      .data(dataYear)
      .enter()
      .append("g")
        .attr("class", "barGroup")
        .attr("transform", function(d) { return "translate(" + x(d.group) + ",0)"; })
      .selectAll("rect")
      .data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key]}; }); })
      .enter().append("rect") // enter = new data array - selection array (previous data array)
        .attr("class", "bar")
        .attr("x", function(d) { return xSubgroup(d.key); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", xSubgroup.bandwidth())
        .attr("fill", function(d) { return color(d.key); })
      .exit().remove();
      svg.selectAll("rect")
        .transition() //assures the transition of the bars
        .duration(400) //the transition lasts 800 ms
          .attr("y", d => y(d.value))
          .attr("height", function(d) { return y(0) - y(d.value); })
        .delay(300)
      // this gets called every time the data changes, it removes previous data you just added (and the ones before that)
      // ^ this ensures the selection array is empty for the next update
      // if you don't do this, you'll get a bunch of duplicate bars
  };

  const generateBarsMonth = (svg, x, x2, y, height, color) => {
    updateYAxisByMonth(svg, y, yRange, height);
    const xSubgroup = addSubXAxis(x2[0], subgroups); // create new xSubgroup

    svg.selectAll(".bar").remove()
    svg
      .selectAll(".barGroup")
        .append("g")
        .attr("class", "barGroup-Secondary")
        .selectAll("g")
          // Enter in data = loop group per group
          .data((d) => { return dataMonth.filter(data => data.group === d.group) })
          .enter()
            .append("g")
            .attr("class", "barGroup-Secondary")
            .style("background-color", "pink")
            .attr("transform", function(d, i) {
              const xCoord = x2
                .find(x =>  x(`${d.group}-${d.groupSecondary}`))
                (`${d.group}-${d.groupSecondary}`)
              console.log('top', i, `${d.group}-${d.groupSecondary}`, xCoord);
              return "translate(" + xCoord + ",0)";
            })
            .selectAll("rect")
            .data(d =>
              subgroups
                .filter(subgroup => !!d[subgroup])
                .map(subgroup => ({key: subgroup, value: d[subgroup]}))
            )
            .enter().append("rect") // enter = new data array - selection array (previous data array)
              .attr("class", "bar")
              .attr("fill", function(d) { return color(d.key); })
              .attr("x", function(d) { return xSubgroup(d.key); })
              .attr("y", function(d) { return y(d.value); })
              .attr("width", xSubgroup.bandwidth())
            .exit().remove();
            svg.selectAll("rect")
              .transition() //assures the transition of the bars
              .duration(400) //the transition lasts 800 ms
                .attr("y", d => y(d.value))
                .attr("height", function(d) { return y(0) - y(d.value); })
              .delay(300)
  };

  // shamelessly got code from here https://medium.com/@kj_schmidt/show-data-on-mouse-over-with-d3-js-3bf598ff8fc2
  const showDataOnHover = (svg) => {
    const div = d3.select("body").append("div")
      .attr("class", "svg1-tooltip")

    svg.selectAll("rect")
    .on('mouseover', function (event, d) {
        d3.select(this).transition()
          .duration('50')
          .attr('opacity', '.8')
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
  const zoomChart = (svg, margin, x, xSubgroup, y, width, height, color) => {
    const extent = [[margin.left, margin.top], [width - margin.right, height - margin.top]];

    svg.call(d3.zoom()
        .scaleExtent([1, 2])
        .translateExtent(extent)
        .extent(extent)
        .on("zoom", zoomed));

    function zoomed(event) {
      /* bit of a hack here: need to manually disable hovered datas when the user zooms */
      d3.selectAll('.svg1-tooltip').style("visibility", 'hidden');
      /* hack end */

      x.range([0, width].map(d => event.transform.applyX(d)));
      // y.range([height, 0].map(d => event.transform.applyY(d)));
      xSubgroup.rangeRound([0, x.bandwidth()]);

      svg.select(".x-axis").call(d3.axisBottom(x));
      // svg.select(".y-axis").call(d3.axisLeft(y));
      // svg.select(".x-axis").call(d3.axisBottom(x).scale(event.transform.rescaleX(x)));
      // svg.select(".y-axis").call(d3.axisLeft(y).scale(event.transform.rescaleY(y)));
      // svg.call(yAxis.scale(event.transform.rescaleY(y)));

      // console.log('range', d3.zoomIdentity, event.transform, x.domain(), y.domain())



      svg.selectAll(".barGroup").attr("transform", (d) => "translate(" + x(d.group) + ",0)");
      // svg.selectAll(".bar")
        // .attr("x", function(d) { return xSubgroup(d.key);})
        // .attr("y", function(d) { console.log('y is', d); return y(d.value);})
        // .attr("height", function(d) { return height - y(d.value); })
        // .attr("width", xSubgroup.bandwidth());

      if (event.transform.k === 2) {
        if (!d3.selectAll("[class*='x-axis-2']").empty()) return;
        const x2 = showSecondaryXAxis(svg, x, height);
        if (d3.selectAll(".barGroup-Secondary").empty()) generateBarsMonth(svg, x, x2, y, height, color)
      } else {
        svg.selectAll(".bar")
          .attr("x", function(d) { return xSubgroup(d.key);})
          .attr("width", xSubgroup.bandwidth());
        if (!d3.selectAll(".barGroup-Secondary").empty()) {
          generateBarsYear(svg, x, y, height, color);
          svg.selectAll("[class*='x-axis-2']").remove();
        }
      }
      showDataOnHover(svg);
    }
  };

  // shamelessly got code from here https://d3-graph-gallery.com/graph/barplot_grouped_basicWide.html
  const renderChart = () => {
    // set the dimensions and margins of the graph
    const { height, chartWidth, legendWidth, margin } = defineChartDimensions();

    // append the svg object to the body of the page
    const svg = createChartSvg(chartWidth, height, margin);

    // add the x Axis
    const x = addXAxis(svg, xAxisDomainYear, chartWidth, height);

    // Add Y axis
    const y = addYAxis(svg, yRange, height, margin);

    // Another axis for subgroup position
    const xSubgroup = addSubXAxis(x, subgroups);

    // let x2 = addSecondaryXAxis(x, xAxisDomainMonth);

    // color palette = one color per subgroup
    const color = defineColorPalette();

    // Show the bars
    generateBarsYear(svg, x, y, height, color);

    // showSecondaryXAxis(svg, x, height);

    // Show data on hover
    showDataOnHover(svg);

    // Create legend
    // Add one dot in the legend for each name.
    createLegends(height, legendWidth, margin, color);

    // add zoom
    zoomChart(svg, margin, x, xSubgroup, y, chartWidth, height, color);
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
