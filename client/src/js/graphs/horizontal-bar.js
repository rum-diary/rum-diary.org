/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var d3 = require('d3');
var DOMinator = require('../lib/dominator');
var margin = {top: 30, right: 10, bottom: 0, left: 100};

var Module = {
  create: function() {
    return Object.create(this);
  },

  init: function(options) {
    this.root = options.root;
    this.data = options.data;
    this.width = options.width || DOMinator(this.root).nth(0).clientWidth;
    this.height = options.height || (30 * this.data.length + margin.top);
  },

  render: function() {
    var width = this.width - margin.left - margin.right;
    var height = this.height - margin.top - margin.bottom;

    this.data.forEach(function(d) {
      d.value = +d.value;
    });
    this.data = this.data.sort(function(a, b) {
      return b.value - a.value;
    });


    var x = d3.scale.linear()
        .domain([0, d3.max(this.data, function(d) { return d.value; })])
        .range([0, width]);

    var y = d3.scale.ordinal()
        .domain(this.data.map(function(d) { return d.title; }))
        .rangeRoundBands([0, height], 0.2);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('top');

    var containerEl = d3.select(this.root);
    var svg = containerEl.append('svg')
        .attr('class', 'bar-chart horizontal')
        .attr('width', this.width)
        .attr('height', this.height)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    svg.selectAll('.bar')
        .data(this.data)
      .enter().append('rect')
        .attr('class', 'bar positive')
        .attr('x', x(0))
        .attr('y', function(d) { return y(d.title); })
        .attr('width', function(d) { return x(d.value) - x(0); })
        .attr('height', y.rangeBand());

    svg.append('g')
        .attr('class', 'x axis')
        .call(xAxis);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);
  }
};

module.exports = Module;

