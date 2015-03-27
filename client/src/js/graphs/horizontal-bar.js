/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const d3 = require('d3');
const DOM = require('dominator');
const margin = {top: 30, right: 10, bottom: 0, left: 100};

class Module {
  constructor () {
  }

  create () {
    return new this();
  }

  init (options={}) {
    this.root = options.root;
    this.data = options.data;
    this.width = options.width || DOM(this.root).nth(0).clientWidth;
    this.height = options.height || (30 * this.data.length + margin.top);
  }

  render () {
    let width = this.width - margin.left - margin.right;
    let height = this.height - margin.top - margin.bottom;

    this.data.forEach(d => {
      d.value = +d.value;
    });
    this.data = this.data.sort((a, b) => b.value - a.value);

    let x = d3.scale.linear()
        .domain([0, d3.max(this.data, d => d.value)])
        .range([0, width]);

    let y = d3.scale.ordinal()
        .domain(this.data.map(d => d.title))
        .rangeRoundBands([0, height], 0.2);

    let xAxis = d3.svg.axis()
        .scale(x)
        .orient('top');

    let containerEl = d3.select(this.root);
    let svg = containerEl.append('svg')
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
        .attr('y', d => y(d.title))
        .attr('width', d => x(d.value) - x(0))
        .attr('height', y.rangeBand());

    svg.append('g')
        .attr('class', 'x axis')
        .call(xAxis);

    let yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);
  }
};

module.exports = Module;

