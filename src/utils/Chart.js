// Based on Mike Bostock's "Tree, Radial Tidy", acknowledgements:
// Copyright 2022 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/radial-tree

import * as d3 from 'd3'

class Chart {
  constructor(mountEl, selectNode, done) {
    this.mountEl = mountEl
    this.selectNode = selectNode
    this.done = done

    this.options = {}

    this.options.tree = d3.tree // layout algorithm (typically d3.tree or d3.cluster)
    this.options.separation = (a, b) => (a.parent === b.parent ? 1 : 2) / a.depth
    this.options.title = d => d.data.source // given a node d, returns its hover text
    this.options.width = mountEl.offsetWidth // outer width, in pixels
    this.options.height = mountEl.offsetHeight // outer height, in pixels
    this.options.margin = Math.max(this.options.width * 0.15, 60) // shorthand for margins
    this.options.marginTop = this.options.margin // top margin, in pixels
    this.options.marginRight = this.options.margin // right margin, in pixels
    this.options.marginBottom = this.options.margin // bottom margin, in pixels
    this.options.marginLeft = this.options.margin // left margin, in pixels
    this.options.radius = Math.min(this.options.width - this.options.marginLeft - this.options.marginRight, this.options.height - this.options.marginTop - this.options.marginBottom) / 2 // outer radius
    this.options.padding = 1 // horizontal padding for first and last column
    this.options.fill = "#999" // fill for nodes
    this.options.stroke = "#555" // stroke for links
    this.options.strokeWidth = 1.5 // stroke width for links
    this.options.strokeOpacity = 0.4 // stroke opacity for links
    this.options.halo = "#fff" // color of label halo 
    this.options.haloWidth = 3 // padding around the labels
    this.options.fontSize = this.options.width / 50
    this.options.r = this.options.fontSize / 10 // radius of nodes

    this.root = null
    this.svg = null
  }

  initTree() {
    const {
      radius,
      marginLeft,
      marginTop,
      width,
      height,
      stroke,
      strokeOpacity,
      strokeLinecap,
      strokeLinejoin,
      strokeWidth,
    } = this.options

    const svg = d3.create("svg")
      .attr("viewBox", [-marginLeft - radius, -marginTop - radius, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("font-family", "sans-serif")

    const g = svg.append("g")
      .attr("id", "transform")
      .attr("font-size", this.options.fontSize)
      .attr("font-family", "'Assistant', sans-serif")

    g.append("g")
      .classed("paths", true)
        .attr("fill", "none")
        .attr("stroke", stroke)
        .attr("stroke-opacity", strokeOpacity)
        .attr("stroke-linecap", strokeLinecap)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("stroke-width", strokeWidth)

    g.append("g")
      .classed("nodes", true)

    svg.call(d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([1, 8])
      .on("zoom", zoomed))

    function zoomed({ transform }) {
      g.attr("transform", transform)
        .attr("font-size", (this.options.fontSize / transform.k))
      
      svg.selectAll("g.captions")
        .attr("stroke-width", (strokeWidth / transform.k))
    }
      
    this.mountEl.appendChild(svg.node())
    this.svg = svg

    return this.svg
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

    const that = this
    const dataLength = this.root.links().length + 1

    this.options.fontSize = 12 - (2 * Math.log10(dataLength))

    const t = this.svg.transition()
      .duration(300)
      .ease(d3.easeQuadOut)

    let pathLength;
    const pathTween = () => d3.interpolateNumber(pathLength, 0);

    this.svg.select("#transform")
      .transition()
      .duration(100)
      .ease(d3.easeQuadOut)
      .attr('font-size', this.options.fontSize)

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
          .on("click", function(_, d) {
            if (this !== that.activeNode) {
              that.setActiveNode(this, d)
            } else {
              that.setActiveNode(null, null)
            }
          })
          .on("mouseover", function() {
            d3.select(this)
              .transition()
              .duration(100)
              .ease(d3.easeQuadOut)
              .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0) scale(1.5)`)
              .attr("opacity", 1)
              
            if (that.done) {
              d3.select(this).raise()
            }
          })
          .on("mouseleave", function() {
            d3.select(this)
              .transition()
              .duration(100)
              .ease(d3.easeQuadOut)
              .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
          })
          .call(select => select.append("circle")
            .attr("r", d => (d.height * 0.35 + 4) - Math.log10(dataLength))
            .attr("fill", "white")
            .attr("stroke-width", 2)
            .attr("stroke", "#545454"))
          .call(enter => enter.transition(t)
            .attr("opacity", 1))
          .append("g")
            .classed("captions", true)
            .attr("fill", "black")
            .attr("stroke", halo)
            .attr("stroke-width", haloWidth)
            .attr("paint-order", "stroke")
            .attr("text-anchor", d => ((d.x < Math.PI)) === !d.children ? "start" : "end")
            .attr("font-size", d => `${1.5 + (d.height * 0.05)}em`)
            .attr("transform", d => d.height ? `rotate(${90 - (180 * d.x / Math.PI)})` : `rotate(${d.x >= Math.PI ? 180 : 0})`)
            .call(select => select.append("text")
              .classed("source", true)
              .attr("font-size", "1em")
              .attr("x", d => (d.height + 6) * ((d.x < Math.PI) === !d.children ? 1 : -1))
              .text(d => d.data.sourceWord))
            .call(select => select.append("text")
              .classed("lang", true)
              .attr("y", "1.2em")
              .attr("x", d => (d.height + 6) * ((d.x < Math.PI) === !d.children ? 1 : -1))
              .attr("font-size", "0.75em")
              .text(d => d.data.sourceLang.refName)),
        update => update
          .call(update => update.transition(t)
            .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`))
          .call(update => update.select("circle")
            .transition(t)
            .attr("r", d => (d.height * 0.35 + 4) - Math.log10(dataLength)))
          .call(update => update.select(".captions")
            .transition(t)
            .attr("text-anchor", d => ((d.x < Math.PI)) === !d.children ? "start" : "end")
            .attr("font-size", d => `${1.5 + (d.height * 0.05)}em`)
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
      this.svg.attr('opacity', 1)
        .transition()
        .duration(300)
        .ease(d3.easeQuadOut)
        .on('end', () => this.svg = null)
        .attr('opacity', 0)
        .remove()
    }
  }

  setActiveNode(node, datum) {
    this.activeNode = node
    this.selectNode(node, datum)
  }
}

export default Chart
