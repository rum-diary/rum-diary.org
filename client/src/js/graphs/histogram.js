/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global RD, d3*/

RD.Graphs.Histogram = (function() {
  'use strict';

  var Module = {
    create: function() {
      return Object.create(this);
    },

    init: function(options) {
      this.root = options.root;
      this.data = options.data;
      this.ticks = options.ticks || 20;
      this.width = options.width || 960;
      this.height = options.height || 500;
    },

    render: function() {
      var margin = {top: 10, right: 30, bottom: 30, left: 30},
          width = this.width - margin.left - margin.right,
          height = this.height - margin.top - margin.bottom;

      var x = d3.scale.linear()
          .domain([d3.min(this.data, function(d) { return d }),
                   d3.max(this.data, function(d) { return d })])
          .range([0, width]);

      // Generate a histogram using twenty uniformly-spaced bins.
      var data = d3.layout.histogram()
          .bins(x.ticks(this.ticks))
          (this.data);

      var y = d3.scale.linear()
          .domain([0, d3.max(data, function(d) { return d.y; })])
          .range([height, 0]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

      var svg = d3.select(this.root).append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var bar = svg.selectAll(".bar")
          .data(data)
        .enter().append("g")
          .attr("class", "bar")
          .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

      bar.append("rect")
          .attr("x", 1)
          .attr("width", x(data[0].dx) - 1)
          .attr("height", function(d) { return height - y(d.y); });

      bar.append("text")
          .attr("dy", ".75em")
          .attr("y", 6)
          .attr("x", x(data[0].dx) / 2)
          .attr("text-anchor", "middle")
          .text(function(d) { return d.y; });

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);
    }
  };

  return Module;
}());

