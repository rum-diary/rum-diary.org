/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var TOTAL_WIDTH = 650,
    TOTAL_HEIGHT = 500,
    MARGIN_TOP = 20,
    MARGIN_RIGHT = 80,
    MARGIN_BOTTOM = 30,
    MARGIN_LEFT = 50;

var d3 = require('d3');
var strformat = require('../string').strformat;

var NAVIGATION_TIMING_SECTIONS = [
  {
    name: 'Redirect',
    start: 'redirectStart',
    end: 'redirectEnd'
  },

  {
    name: 'App cache',
    start: 'fetchStart',
    end: 'domainLookupStart'
  },

  {
    name: 'DNS',
    start: 'domainLookupStart',
    end: 'domainLookupEnd'
  },

  {
    name: 'TCP',
    start: 'connectStart',
    end: 'connectEnd'
  },

  {
    name: 'Request response',
    start: 'requestStart',
    end: 'responseEnd'
  },

  {
    name: 'Processing',
    start: 'domLoading',
    end: 'domComplete'
  },

  {
    name: 'Loading',
    start: 'loadEventStart',
    end: 'loadEventEnd'
  },

  {
    name: 'DOMContentLoaded',
    start: 'domContentLoadedEventStart',
    end: 'domContentLoadedEventEnd'
  }
];

var BACKGROUND_COLORS = [
  'dodgerblue',
  'peachpuff',
  'tan',
  'firebrick',
  'aquamarine',
  'lightskyblue',
  'salmon',
  'green'
];

var Module = {
  create: function() {
    return Object.create(this);
  },

  init: function(options) {
    options = options || {};

    this.data = options.data || [];
    this.root = options.root || '#navigation-timing-graph';

    this.total_width = options.width || TOTAL_WIDTH;
    this.total_height = options.height || TOTAL_HEIGHT;
  },

  render: function() {
    var chartWidth = this.total_width - MARGIN_LEFT - MARGIN_RIGHT;
    var chartHeight = this.total_height - MARGIN_TOP - MARGIN_BOTTOM;
    var barWidth = (chartWidth / this.data.length) - 20;

    var chartData = toChartData(this.data);

    var svg = createSvgElement(this.root, chartWidth, chartHeight);
    var x = createXAxis(svg, chartWidth, chartHeight, chartData);
    var y = createYAxis(svg, chartWidth, chartHeight, chartData);
    var z = d3.scale.ordinal().range(BACKGROUND_COLORS);
    var tooltip = createTooltip();

    var container = drawContainer(svg, chartData);
    drawSeries(container, x, y, z, barWidth, tooltip);
  }

};


module.exports = Module;

function toChartData(navigationTimingSeries) {
  return navigationTimingSeries.map(toChartSeries).reduce(function(total, series) {
    return total.concat(series);
  }, []);
}

function toChartSeries(navigationTimingData, x) {
  var count = 0;

  var chartData = NAVIGATION_TIMING_SECTIONS.map(function(section) {
    var data = {
      x: x,
      z: count,
      end: section.end,
      end_y: navigationTimingData[section.end],
      start: section.start,
      start_y: navigationTimingData[section.start],
      name: section.name
    };

    count++;
    return data;
  });

  return chartData;
}

function createXAxis(svg, width, height, chartData) {
  var x = d3.scale.linear()
    .range([0, width]);

  setXDomain(x, chartData);

  return x;
}

function createYAxis(svg, width, height, chartData) {
  var y = d3.scale.linear()
      .range([height, 0]);

  setYDomain(y, chartData);

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient('left');

  svg.append('g')
          .attr('class', 'y axis')
          .call(yAxis)
          .selectAll('text')
            .attr('class', 'axis-label axis-label-y');

  return y;
}

function createSvgElement(root, width, height) {
  var svg = d3.select(root).append('svg')
      .attr('width', width + MARGIN_LEFT + MARGIN_RIGHT)
      .attr('height', height + MARGIN_TOP + MARGIN_BOTTOM)
    .append('g')
      .attr('class', 'svg-group')
      .attr('transform', 'translate(' + MARGIN_LEFT + ',' + MARGIN_TOP + ')');

  return svg;
}

function setXDomain(x, chartData) {
  x.domain([0, d3.max(chartData, function(d) {
    return d.x;
  })]);
}

function setYDomain(y, chartData) {
  y.domain([0, d3.max(chartData, function(d) {
    return d.end_y;
  })]);
}


function createTooltip() {
  var tooltip = require('../tooltip').create();
  tooltip.init({
    appendTo: 'body'
  });

  return tooltip;
}

function drawContainer(svg, chartData) {
  return svg.selectAll('.svg-group')
          .data(chartData)
        .enter().append('g')
          .attr('class', 'section')
          .style('fill', '#ffffff');
}

function drawSeries(container, x, y, z, barWidth, tooltip) {
    // Add a rect for each field
    container.selectAll('rect')
        .data(function(d) {
          // data must be returned in an array or else no rects are added.
          return [d];
        })
      .enter().append('rect')
        .attr('x', function(d) {
          return (1 + d.x) * 10 + (d.x * barWidth);
        })
        .attr('y', function(d) {
          return y(d.end_y);
        })
        .attr('height', function(d) {
          return y(d.start_y) - y(d.end_y);
        })
        .style('fill', function(d) {
          return z(d.z);
        })
        .style('opacity', function() {
          return 0.5;
        })
        .attr('width', '' + barWidth)
        .style('stroke', '#000000')
        .attr('rx', '5')
        .on('mouseenter', function(d) {
          var tooltipHTML = strformat(
              '<h3 class="tooltip-title">%s</h3>' +
              '<p class="tooltip-section">%s: %s</p>' +
              '<p class="tooltip-section">%s: %s</p>',
              d.name,
              d.start,
              d.start_y,
              d.end,
              d.end_y);

          tooltip.html(tooltipHTML);
          tooltip.show();
        })
        .on('mousemove', function() {
          tooltip.move(
              (d3.event.pageX+10)+'px',
              (d3.event.pageY-10)+'px');
        })
        .on('mouseleave', function() {
          tooltip.hide();
        });

  }

