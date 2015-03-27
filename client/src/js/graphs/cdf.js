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

  init (options = {}) {
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

    let min = 0;
    let max = this.data[this.data.length - 1].x;

    let x = d3.scale.linear()
        .domain([min, max])
        .range([0, width]);

    let y = d3.scale.linear()
        .domain([0, 1])
        .range([height, 0]);

    let xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');

    let yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    let area = d3.svg.area()
        .x(d => x(d.x))
        .y0(height)
        .y1(d => y(d.y));

    let svg = d3.select(this.root).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

     svg.append('path')
          .datum(this.data)
          .attr('class', 'main-area')
          .attr('d', area);

      svg.append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0,${height})`)
          .call(xAxis);

      svg.append('g')
          .attr('class', 'y-axis')
          .call(yAxis)
        .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '.71em');
  }
};

module.exports = Module;
