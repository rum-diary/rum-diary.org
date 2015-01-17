/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var d3 = require('d3');
var strformat = require('string-utils').format;

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

    var min = 0;
    var max = this.data[this.data.length - 1].x;

    var x = d3.scale.linear()
        .domain([min, max])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, 1])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    var area = d3.svg.area()
        .x(function(d) {
          return x(d.x);
        })
        .y0(height)
        .y1(function(d) {
          return y(d.y);
        });

    var svg = d3.select(this.root).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

     svg.append('path')
          .datum(this.data)
          .attr('class', 'main-area')
          .attr('d', area);

      svg.append('g')
          .attr('class', 'x-axis')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis);

      svg.append('g')
          .attr('class', 'y-axis')
          .call(yAxis)
        .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '.71em');

    var tooltip = createTooltip();

        /*
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
        */
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

