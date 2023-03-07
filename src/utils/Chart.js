// Copyright 2022 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/radial-tree

import * as d3 from 'd3'
import iso from './iso.json'

class Chart {
  constructor(mountEl, {
    tree = d3.tree, // layout algorithm (typically d3.tree or d3.cluster)
    separation = tree === d3.tree ? (a, b) => (a.parent === b.parent ? 1 : 2) / a.depth : (a, b) => a.parent === b.parent ? 1 : 2,
    title, // given a node d, returns its hover text
    link, // given a node d, its link (if any)
    linkTarget = "_blank", // the target attribute for links (if any)
    width = Math.min(window.innerWidth, window.innerHeight), // outer width, in pixels
    height = width, // outer height, in pixels
    margin = Math.min(width * 0.1, 60), // shorthand for margins
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
      root.sort()
  
      // Compute the layout.
      tree().size([2 * Math.PI, radius]).separation(separation)(root);
      
      this.root = root
    } catch (e) {
      console.warn(e)
      const messageSplit = e.message.split(': ')
      const errorObj = {
        hasError: true,
        type: messageSplit[0],
        node: messageSplit[1]
      }

      return errorObj
    }

    return false
  }

  layOutTree() {
    const {
      radius,
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
      fill,
      r,
    } = this.options

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

    const nodes = svg.append("g")
      .classed("nodes", true)

    nodes.append("circle")
      .attr("fill", fill ? fill : stroke)
      .attr("r", r);
      
    this.mountEl.appendChild(svg.node())
    this.svg = svg

    return this.svg
  }

  initTree() {
    return this.layOutTree()
  }

  updateTree() {
    if (!this.svg) {
      return false
    }
    
    const {
      link,
      linkTarget,
      halo,
      haloWidth,
    } = this.options

    const t = this.svg.transition()
      .duration(300)
      .ease(d3.easeQuadOut)

    let pathLength;
    const pathTween = () => d3.interpolateNumber(pathLength, 0);

    this.svg.select(".paths")
      .selectAll("path")
      .data(this.root.links(), d => `${d.source.id}-${d.target.id}`)
      .join(
        enter => enter.append("path")
          .attr("stroke", "none")
          .attr("d", d3.linkRadial()
            .angle(d => d.x)
            .radius(d => d.y))
          .attr("stroke-dasharray", function() {
            return pathLength = this.getTotalLength()
          })
          .attr("stroke-dashoffset", 0)
          .call(path => path.transition(t)
            .attr("stroke", "black")
            .attrTween("stroke-dashoffset", pathTween)
          ),
        update => update
          .attr("stroke", "black")
          .attr("stroke-dasharray", 0)
          .attr("stroke-dashoffset", 0)
          .call(path => path.transition(t)
            .attr("d", d3.linkRadial()
              .angle(d => d.x)
              .radius(d => d.y))
            ),
        exit => exit
          .call(exit => exit.transition(t)
            .attr("opacity", 0)
            .remove()
          )
      )
    
    this.svg.select(".nodes")
      .selectAll("a")
      .data(this.root.descendants(), d => `${d.data.source}-${d.height}`)
      .join(
        enter => enter.append("a")
          .attr("xlink:href", link == null ? null : d => link(d.data, d))
          .attr("target", link == null ? null : linkTarget)
          .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
          .attr("opacity", 0)
          .call(select => select.append("circle")
            .attr("r", d => d.height + 2))
          .call(enter => enter.transition(t)
            .attr("opacity", 1))
          .append("g")
            .classed("captions", true)
            .attr("stroke", halo)
            .attr("stroke-width", haloWidth)
            .attr("paint-order", "stroke")
            .attr("text-anchor", d => ((d.x < Math.PI)) === !d.children ? "start" : "end")
            .attr("font-size", d => 10 + (d.height * 2.5))
            .attr("transform", d => d.height ? `rotate(${90 - (180 * d.x / Math.PI)})` : `rotate(${d.x >= Math.PI ? 180 : 0})`)
            .call(select => select.append("text")
              .classed("source", true)
              .attr("font-size", "1em")
              .attr("x", d => (d.height + 6) * ((d.x < Math.PI) === !d.children ? 1 : -1))
              .text(d => d.data.source.split(': ')[1]))
            .call(select => select.append("text")
              .classed("lang", true)
              .attr("y", "1.2em")
              .attr("x", d => (d.height + 6) * ((d.x < Math.PI) === !d.children ? 1 : -1))
              .attr("font-size", "0.75em")
              .text(d => {
                const printLang = iso[d.data.source.split(': ')[0]]
                return printLang ? printLang : ''
              })),
        update => update
          .call(update => update.transition(t)
            .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`))
          .call(update => update.select("circle")
            .transition(t)
            .attr("r", d => d.height + 2))
          .call(update => update.select(".captions")
            .transition(t)
            .attr("text-anchor", d => ((d.x < Math.PI)) === !d.children ? "start" : "end")
            .attr("font-size", d => 10 + (d.height * 2.5))
            .attr("transform", d => d.height ? `rotate(${90 - (180 * d.x / Math.PI)})` : `rotate(${d.x >= Math.PI ? 180 : 0})`))
          .call(select => select.select(".source")
            .transition(t)
            .attr("x", d => (d.height + 6) * ((d.x < Math.PI) === !d.children ? 1 : -1)))
          .call(select => select.select(".lang")
            .transition(t)
            .attr("y", "1.2em")
            .attr("x", d => (d.height + 6) * ((d.x < Math.PI) === !d.children ? 1 : -1))),
        exit => exit.call(exit => exit.transition(t)
          .attr("opacity", 0)
          .remove()))
  }

  destroyTree() {
    if (this.svg) {
      this.svg.remove()
      this.svg = null
    }
  }
}

export default Chart
