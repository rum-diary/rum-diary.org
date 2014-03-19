/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*global d3*/

'use strict';

var strformat = require('../string').strformat;

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

    // Generate a histogram using uniformly-spaced bins.
    var data = d3.layout.histogram()
        .bins(x.ticks(this.ticks))
        (this.data);

    // use 2px to give a nice border between adjacent elements.
    var rectWidth = Math.ceil((width / data.length) - 2);
    // offset the rect by half the width so they
    // are centered on their x.
    var rectOffset = (rectWidth / 2) - 1;

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
        .attr("transform", function(d) { return "translate(" + (x(d.x) - rectOffset) + "," + y(d.y) + ")"; });

    var tooltip = createTooltip();

    bar.append("rect")
        .attr("x", 1)
        .attr("width", rectWidth)
        .attr("height", function(d) {
            return height - y(d.y);
        })
        .on('mouseenter', function(d) {
          var tooltipHTML = strformat(
              '<h3 class="tooltip-title noborder">%s->%s</h3>',
              d.x,
              d.y);

          tooltip.html(tooltipHTML);
          tooltip.show();
        })
        .on('mousemove', function() {
          tooltip.move(
              (d3.event.pageX+10)+'px',
              (d3.event.pageY-10)+'px');
        })
        .on('mouseleave', function(d) {
          tooltip.hide();
        });

    /*
    bar.append("text")
        .attr("dy", ".75em")
        .attr("y", 6)
        .attr("x", x(data[0].dx) / 2)
        .attr("text-anchor", "middle")
        .text(function(d) { return d.y; });
        */

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
  }
};

function createTooltip() {
  var tooltip = require('../tooltip').create();
  tooltip.init({
    appendTo: 'body'
  });

  return tooltip;
}

module.exports = Module;

