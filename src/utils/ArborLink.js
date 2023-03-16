class ArborLink {
  static areEqual(link, otherLink) {
    return (
      link.source === otherLink.source &&
      link.target === otherLink.target
    )
  }

  constructor(source, target) {
    this.source = source.source
    this.target = target.source

    return this
  }

  equals(otherLink) {
    return (
      this.source === otherLink.source &&
      this.target === otherLink.target
    )
  }

  toString() {
    return JSON.stringify(this)
  }
}

export default ArborLink
