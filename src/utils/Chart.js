// Copyright 2022 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/radial-tree

import * as d3 from 'd3'

class Chart {
  constructor(mountEl, {
    tree = d3.tree, // layout algorithm (typically d3.tree or d3.cluster)
    separation = tree === d3.tree ? (a, b) => (a.parent == b.parent ? 1 : 2) / a.depth : (a, b) => a.parent == b.parent ? 1 : 2,
    label = d => d.source, // given a node d, returns the display name
    title, // given a node d, returns its hover text
    link, // given a node d, its link (if any)
    linkTarget = "_blank", // the target attribute for links (if any)
    width = 1640, // outer width, in pixels
    height = 1400, // outer height, in pixels
    margin = 60, // shorthand for margins
    marginTop = margin, // top margin, in pixels
    marginRight = margin, // right margin, in pixels
    marginBottom = margin, // bottom margin, in pixels
    marginLeft = margin, // left margin, in pixels
    radius = Math.min(width - marginLeft - marginRight, height - marginTop - marginBottom) / 2, // outer radius
    r = 3, // radius of nodes
    padding = 1, // horizontal padding for first and last column
    fill = "#999", // fill for nodes
    fillOpacity, // fill opacity for nodes
    stroke = "#555", // stroke for links
    strokeWidth = 1.5, // stroke width for links
    strokeOpacity = 0.4, // stroke opacity for links
    strokeLinejoin, // stroke line join for links
    strokeLinecap, // stroke line cap for links
    halo = "#fff", // color of label halo 
    haloWidth = 3, // padding around the labels
    fontSize = 10, // font size of labels
  } = {}) {
    this.mountEl = mountEl
    this.options = {
      tree,
      separation,
      label,
      title,
      link,
      linkTarget,
      width,
      height,
      margin,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      radius,
      r,
      padding,
      fill,
      fillOpacity,
      stroke,
      strokeWidth,
      strokeOpacity,
      strokeLinejoin,
      strokeLinecap,
      halo,
      haloWidth,
      fontSize,
    }

    this.root = null
    this.svg = null
  }

  ingestData(data) {
    const {
      sort,
      tree,
      radius,
      separation,
    } = this.options

    const id = Array.isArray(data) ? d => d.source : null // if tabular data, given a d in data, returns a unique identifier (string)
    const parentId = Array.isArray(data) ? d => d.target : null // if tabular data, given a node d, returns its parent’s identifier

    try {
      // If id and parentId options are specified, or the path option, use d3.stratify
      // to convert tabular data to a hierarchy; otherwise we assume that the data is
      // specified as an object {children} with nested objects (a.k.a. the “flare.json”
      // format), and use d3.hierarchy.
      const root = d3.stratify().id(id).parentId(parentId)(data)
  
      // Sort the nodes.
      if (sort != null) root.sort(sort);
  
      // Compute the layout.
      tree().size([2 * Math.PI, radius]).separation(separation)(root);
      
      this.root = root
    } catch (e) {
      console.warn(e)
    }

    return this.root
  }

  layOutTree() {
    const {
      radius,
      label,
      marginLeft,
      marginTop,
      width,
      height,
      fontSize,
      stroke,
      strokeOpacity,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
      link,
      linkTarget,
      fill,
      title,
      r,
      halo,
      haloWidth,
    } = this.options

    const descendants = this.root.descendants();
    const L = label == null ? null : descendants.map(d => label(d.data, d));

    const svg = d3.create("svg")
      .attr("viewBox", [-marginLeft - radius, -marginTop - radius, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("font-family", "sans-serif")
      .attr("font-size", fontSize);

    svg.append("g")
      .classed("paths", true)
      .attr("fill", "none")
      .attr("stroke", stroke)
      .attr("stroke-opacity", strokeOpacity)
      .attr("stroke-linecap", strokeLinecap)
      .attr("stroke-linejoin", strokeLinejoin)
      .attr("stroke-width", strokeWidth)
      .selectAll("path")
      .data(this.root.links())
      .join("path")
      .attr("d", d3.linkRadial()
      .angle(d => d.x)
      .radius(d => d.y));

    const node = svg.append("g")
      .classed("nodes", true)
      .selectAll("a")
      .data(this.root.descendants())
      .join("a")
      .attr("xlink:href", link == null ? null : d => link(d.data, d))
      .attr("target", link == null ? null : linkTarget)
      .attr("transform", d => {
        console.log(d)
        return `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`
      });

    node.append("circle")
      .attr("fill", d => d.children ? stroke : fill)
      .attr("r", r);

    if (title != null) node.append("title")
      .text(d => title(d.data, d));

    if (L) node.append("text")
      .attr("transform", d => `rotate(${d.x >= Math.PI ? 180 : 0})`)
      .attr("dy", "0.32em")
      .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
      .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
      .attr("paint-order", "stroke")
      .attr("stroke", halo)
      .attr("stroke-width", haloWidth)
      .text((d, i) => L[i]);

    this.mountEl.appendChild(svg.node())
    this.svg = svg

    return this.svg
  }

  initTree(data) {
    // If id and parentId options are specified, or the path option, use d3.stratify
    // to convert tabular data to a hierarchy; otherwise we assume that the data is
    // specified as an object {children} with nested objects (a.k.a. the “flare.json”
    // format), and use d3.hierarchy.
    this.ingestData(data)
    this.layOutTree()

    return this.svg
  }

  updateTree(newData) {
    if (!this.svg) {
      return this.initTree(newData)
    }

    const {
      label,
      link,
      linkTarget,
      halo,
      haloWidth,
    } = this.options
    
    this.ingestData(newData)

    const descendants = this.root.descendants();
    const L = label == null ? null : descendants.map(d => label(d.data, d));

    this.svg.select(".paths")
      .selectAll("path")
      .data(this.root.links())
      .join("path")
        .attr("d", d3.linkRadial()
          .angle(d => d.x)
          .radius(d => d.y));

    this.svg.select(".nodes")
    .selectAll("a")
    .data(this.root.descendants())
    .join("a")
      .attr("xlink:href", link == null ? null : d => link(d.data, d))
      .attr("target", link == null ? null : linkTarget)
      .attr("transform", d => {
        console.log(d)
        return `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`
      })
      .append("text")
      .attr("transform", d => `rotate(${d.x >= Math.PI ? 180 : 0})`)
      .attr("dy", "0.32em")
      .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
      .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
      .attr("paint-order", "stroke")
      .attr("stroke", halo)
      .attr("stroke-width", haloWidth)
      .text((d, i) => L[i]);
  }
}

export default Chart
