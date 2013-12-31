/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global RD, d3*/

RD.Graphs.NavigationTiming = (function() {
  'use strict';

    var TOTAL_WIDTH = 960,
        TOTAL_HEIGHT = 500,
        MARGIN_TOP = 20,
        MARGIN_RIGHT = 80,
        MARGIN_BOTTOM = 30,
        MARGIN_LEFT = 50;

    var NAVIGATION_TIMING_FIELDS = {
      /*
      'navigationStart': undefined,
      'unloadEventStart': undefined,
      */
      'unloadEventEnd': undefined,
      /*'redirectStart': undefined,*/
      'redirectEnd': undefined,

      /*
      'fetchStart': undefined,
      */

      /*'domainLookupStart': undefined,*/
      'domainLookupEnd': undefined,

      /*'connectStart': undefined,*/
      /*'secureConnectionStart': undefined,*/
      'connectEnd': undefined,

      /*'requestStart': undefined,*/
      /*'responseStart': undefined,*/
      'responseEnd': undefined,

      /*'domLoading': undefined,*/
      /*
      'domInteractive': undefined,
      'domContentLoadedEventStart': undefined,
      'domContentLoadedEventEnd': undefined,
      'domComplete': undefined,
      'loadEventStart': undefined,*/
      'loadEventEnd': undefined
    };


  var Module = {
    init: function(options) {
      options = options || {};

      this.data = options.data;
    },

    render: function() {
      var width = TOTAL_WIDTH - MARGIN_LEFT - MARGIN_RIGHT,
          height = TOTAL_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM;

      var chartData = toChartData(this.data);

      var svg = createSvgElement(width, height);

      var x = createXAxis(svg, width, height, chartData);

      var y = createYAxis(svg, width, height, chartData);

      var z = d3.scale.ordinal()
          .range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);

      // Add a group for each section.
      /*
      var section = svg.selectAll('.svg-group')
          .data(chartData)
        .enter().append('svg:g')
          .attr('class', 'section')
          .style('fill', '#ffffff')
          .style('stroke', '#000000');

*/

      // Add a rect for each field
      var rect = svg.selectAll('.svg-group')
          .data(chartData)
        .enter().append('svg:rect')
          .attr('x', function(d) {
            return 1;//x(d.x);
          })
          .attr('y', function(d) {
            return y(d.start_y + d.y);
          })
          .style('fill', function(d, i) {
            return z(i);
          })
          .attr('width', '50')
          .attr('height', function(d) {
            return y(d.start_y) - y(d.start_y + d.y);
          });

    }

  };

  Module.create = function() {
    return Object.create(Module);
  };

  return Module;

  function toChartData(navigationTimingData) {
    var count = 0;
    var total = 0;

    var chartData = Object.keys(NAVIGATION_TIMING_FIELDS).map(function(key) {
      var curr = navigationTimingData[key];
      var data = {
        x: count,
        y: curr,
        start_y: total
      };

      count++;
      total += curr;

      return data;
    });

    return chartData;
  }

  function createXAxis(svg, width, height, chartData) {
    var x = d3.scale.linear()
      .range([0, width]);

    setXDomain(x, chartData);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

    return x;
  }

  function createYAxis(svg, width, height, chartData) {
    var y = d3.scale.linear()
        .range([height, 0]);

    setYDomain(y, chartData);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

    return y;
  }

  function createSvgElement(width, height) {
    var svg = d3.select('#navigation-timing-graph').append('svg')
        .attr('width', width + MARGIN_LEFT + MARGIN_RIGHT)
        .attr('height', height + MARGIN_TOP + MARGIN_BOTTOM)
      .append('g')
        .attr('class', 'svg-group')
        .attr('transform', 'translate(' + MARGIN_LEFT + ',' + MARGIN_TOP + ')');

    return svg;
  }

  function setXDomain(x, chartData) {
    x.domain(d3.extent(chartData, function(d) {
      return d.x;
    }));
  }

  function setYDomain(y, chartData) {
    y.domain([0, d3.max(chartData, function(d) {
      return d.start_y + d.y;
    })]);
  }


}());

