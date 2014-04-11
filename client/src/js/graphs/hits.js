/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global d3*/

'use strict';

var Module = {
  create: function () {
    return Object.create(this);
  },

  init: function(options) {
    this.root = options.root || '#hits-graph';
    this.containerEl = d3.select(this.root)[0][0];
    this.data = options.data;
    /*this.width = options.width || this.containerEl.clientWidth;*/
    this.height = 200;//options.height || 350;
  },

  render: function () {
    var containerEl = this.containerEl;
    var containerWidth = containerEl.clientWidth;

    var data = this.data;

    var margin = {top: 20, right: 10, bottom: 70, left: 30},
        width = containerWidth - margin.left - margin.right,
        height = this.height - margin.top - margin.bottom;

    var parseDate = d3.time.format('%Y-%m-%d').parse;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.category10();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    var valueline = d3.svg.line()
        .x(function(d) {
          return x(d.date);
        })
        .y(function(d) {
          return y(d.hits);
        });

    var area = d3.svg.area()
        .x(function(d) { return x(d.date); })
        .y0(height)
        .y1(function(d) { return y(d.hits); });


    var svgEl = d3.select('#hits-graph').append('svg')
        .attr('width', containerWidth + 'px')
        .attr('height', height + margin.top + margin.bottom);

    var svg = svgEl.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    color.domain(['hits']);

    data.forEach(function(d) {
      d.date = parseDate(d.date);
      d.hits = +d.hits;
    });

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.hits; })]);

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
        .selectAll('text')
          .attr('class', 'axis-label axis-label-x');


    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('Hits / day');

    svg.selectAll('.y .tick text')
        .attr('class', 'axis-label axis-label-y');


    var pathEl = svg.append('path')
        .datum(data)
        .attr('class', 'area')
        /*.attr('d', valueline(data));*/
        .attr('d', area);

    d3.select(window).on('resize', resize);

    function resize() {
      containerWidth = containerEl.clientWidth;
      // first, update the svg element's width
      svgEl.attr('width', containerWidth + 'px');

      width = containerWidth - margin.left - margin.right,

      // now, update the range so the axis knows how to update itself.
      x.range([0, width]);

      // tell the axis to redraw
      svgEl.select('.x.axis').call(xAxis.orient('bottom'));

      // now tell the path to redraw.
      pathEl.attr('d', valueline(data));
    }
  }
};

module.exports = Module;

