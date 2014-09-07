/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

var d3 = require('d3');
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
        height = this.height - margin.top - margin.bottom,
        radius = Math.min(width, height) / 2;


    var color = d3.scale.ordinal()
        .range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00',
                '#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00']);

    var arc = d3.svg.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.value; });

    var svg = d3.select(this.root).append('svg')
        .attr('width', width)
        .attr('height', height)
      .append('g')
        .attr('transform', strformat('translate(%s, %s)',  width / 2, height / 2));

    this.data.forEach(function(d) {
      d.value = +d.value;
    });

    var tooltip = createTooltip();

    var g = svg.selectAll('.arc')
        .data(pie(this.data))
      .enter().append('g')
        .attr('class', 'arc');

    g.append('path')
        .attr('d', arc)
        .attr('class', 'slice')
        .style('fill', function(d) { return color(d.data.title); })
        .on('mouseenter', function(d) {
          var tooltipHTML = strformat(
              '<h3 class="tooltip-title noborder">%s->%s</h3>',
              d.data.title,
              d.value);

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

    g.append('text')
        .attr('transform', function(d) { return 'translate(' + arc.centroid(d) + ')'; })
        .attr('dy', '.35em')
        .style('text-anchor', 'middle')
        .text(function(d) { return d.data.title; });


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

