/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

const TOTAL_WIDTH = 650;
const TOTAL_HEIGHT = 500;
const MARGIN_TOP = 20;
const MARGIN_RIGHT = 80;
const MARGIN_BOTTOM = 30;
const MARGIN_LEFT = 50;

const d3 = require('d3');

const NAVIGATION_TIMING_SECTIONS = [
  {
    name: 'Redirect',
    start: 'redirectStart',
    end: 'redirectEnd'
  },

  {
    name: 'App cache',
    start: 'fetchStart',
    end: 'domainLookupStart'
  },

  {
    name: 'DNS',
    start: 'domainLookupStart',
    end: 'domainLookupEnd'
  },

  {
    name: 'TCP',
    start: 'connectStart',
    end: 'connectEnd'
  },

  {
    name: 'Request response',
    start: 'requestStart',
    end: 'responseEnd'
  },

  {
    name: 'Processing',
    start: 'domLoading',
    end: 'domComplete'
  },

  {
    name: 'Loading',
    start: 'loadEventStart',
    end: 'loadEventEnd'
  },

  {
    name: 'DOMContentLoaded',
    start: 'domContentLoadedEventStart',
    end: 'domContentLoadedEventEnd'
  }
];

const BACKGROUND_COLORS = [
  'dodgerblue',
  'peachpuff',
  'tan',
  'firebrick',
  'aquamarine',
  'lightskyblue',
  'salmon',
  'green'
];

class Module {
  constructor () {
  }

  static create () {
    return new this()
  }

  init (options) {
    options = options || {};

    this.data = options.data || [];
    this.root = options.root || '#navigation-timing-graph';

    this.total_width = options.width || TOTAL_WIDTH;
    this.total_height = options.height || TOTAL_HEIGHT;
  }

  render () {
    let chartWidth = this.total_width - MARGIN_LEFT - MARGIN_RIGHT;
    let chartHeight = this.total_height - MARGIN_TOP - MARGIN_BOTTOM;
    let barWidth = (chartWidth / this.data.length) - 20;

    let chartData = toChartData(this.data);

    let svg = createSvgElement(this.root, chartWidth, chartHeight);
    let x = createXAxis(svg, chartWidth, chartHeight, chartData);
    let y = createYAxis(svg, chartWidth, chartHeight, chartData);
    let z = d3.scale.ordinal().range(BACKGROUND_COLORS);
    let tooltip = createTooltip();

    let container = drawContainer(svg, chartData);
    drawSeries(container, x, y, z, barWidth, tooltip);
  }
};


module.exports = Module;

function toChartData(navigationTimingSeries) {
  return navigationTimingSeries.map(toChartSeries).reduce((total, series) => {
    return total.concat(series);
  }, []);
}

function toChartSeries(navigationTimingData, x) {
  let count = 0;

  let chartData = NAVIGATION_TIMING_SECTIONS.map((section) => {
    let data = {
      x: x,
      z: count,
      end: section.end,
      end_y: navigationTimingData[section.end],
      start: section.start,
      start_y: navigationTimingData[section.start],
      name: section.name
    };

    count++;
    return data;
  });

  return chartData;
}

function createXAxis(svg, width, height, chartData) {
  let x = d3.scale.linear()
    .range([0, width]);

  setXDomain(x, chartData);

  return x;
}

function createYAxis(svg, width, height, chartData) {
  let y = d3.scale.linear()
      .range([height, 0]);

  setYDomain(y, chartData);

  let yAxis = d3.svg.axis()
      .scale(y)
      .orient('left');

  svg.append('g')
          .attr('class', 'y-axis')
          .call(yAxis)
          .selectAll('text')
            .attr('class', 'axis-label axis-label-y');

  return y;
}

function createSvgElement(root, width, height) {
  let svg = d3.select(root).append('svg')
      .attr('width', width + MARGIN_LEFT + MARGIN_RIGHT)
      .attr('height', height + MARGIN_TOP + MARGIN_BOTTOM)
    .append('g')
      .attr('class', 'svg-group')
      .attr('transform', `translate${MARGIN_LEFT},${MARGIN_TOP})`);

  return svg;
}

function setXDomain(x, chartData) {
  x.domain([0, d3.max(chartData, d => d.x)]);
}

function setYDomain(y, chartData) {
  y.domain([0, d3.max(chartData, d => d.end_y)]);
}


function createTooltip() {
  let tooltip = require('../tooltip').create();
  tooltip.init({
    appendTo: 'body'
  });

  return tooltip;
}

function drawContainer(svg, chartData) {
  return svg.selectAll('.svg-group')
          .data(chartData)
        .enter().append('g')
          .attr('class', 'section')
          .style('fill', '#ffffff');
}

function drawSeries(container, x, y, z, barWidth, tooltip) {
    // Add a rect for each field
    container.selectAll('rect')
        // data must be returned in an array or else no rects are added.
        .data(d => [d])
      .enter().append('rect')
        .attr('x', d => (1 + d.x) * 10 + (d.x * barWidth))
        .attr('y', d => y(d.end_y))
        .attr('height', d => y(d.start_y) - y(d.end_y))
        .style('fill', d => z(d.z))
        .style('opacity', d => 0.5)
        .attr('width', '' + barWidth)
        .style('stroke', '#000000')
        .attr('rx', '5')
        .on('mouseenter', d => {
          let tooltipHTML = `
              <h3 class="tooltip-title">${d.name}</h3>
              <p class="tooltip-section">${d.start}: ${d.start_y}</p>
              <p class="tooltip-section">${d.end}: ${d.end_y}</p>`;

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

  }

