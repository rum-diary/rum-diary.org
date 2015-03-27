/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const d3 = require('d3');

class Module {
  constructor () {
  }

  static create () {
    return new this();
  }

  init (options={}) {
    this.root = options.root;
    this.data = options.data;
    this.ticks = options.ticks || 20;
    this.width = options.width || 960;
    this.height = options.height || 500;
  }

  render () {
    let margin = {top: 10, right: 30, bottom: 30, left: 30};
    let width = this.width - margin.left - margin.right;
    let height = this.height - margin.top - margin.bottom;

    let x = d3.scale.linear()
        .domain([0, d3.max(this.data, d => d)])
        .range([0, width]);

    // Generate a histogram using uniformly-spaced bins.
    let data = d3.layout.histogram()
        .bins(x.ticks(this.ticks))(this.data);

    // use 2px to give a nice border between adjacent elements.
    let rectWidth = Math.ceil((width / data.length) - 2);
    // offset the rect by half the width so they
    // are centered on their x.
    let rectOffset = (rectWidth / 2) - 1;

    let y = d3.scale.linear()
        .domain([0, d3.max(data, d => d.y)])
        .range([height, 0]);

    let xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    let svg = d3.select(this.root).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    let bar = svg.selectAll(".bar")
        .data(data)
      .enter().append("g")
        .attr("class", "bar")
        .attr("transform", d => "translate(" + (x(d.x) - rectOffset) + "," + y(d.y) + ")");

    let tooltip = createTooltip();

    bar.append("rect")
        .attr("x", 1)
        .attr("width", rectWidth)
        .attr("height", d => height - y(d.y))
        .on('mouseenter', d => {
          let tooltipHTML = `<h3 class="tooltip-title noborder">${d.x}->${d.y}</h3>`;
          tooltip.html(tooltipHTML);
          tooltip.show();
        })
        .on('mousemove', () => {
          tooltip.move(
              `${d3.event.pageX+10}px`,
              `${d3.event.pageY-10}px`);
        })
        .on('mouseleave', () => {
          tooltip.hide();
        });

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);
  }
};

function createTooltip() {
  let tooltip = require('../tooltip').create();
  tooltip.init({
    appendTo: 'body'
  });

  return tooltip;
}

module.exports = Module;

