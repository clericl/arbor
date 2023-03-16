import iso639_3 from './iso639-3.json'
import iso639AllCodes from './iso639AllCodes.json'

class ArborNode {
  static areEqual(node, otherNode) {
    return node.source === otherNode.source
  }

  constructor(source) {
    this.source = source

    const split = this.source.split(': ')

    this.lang3 = split[0]
    this.word = split[1]
    this.langRefName = iso639_3[this.lang3]
    this.lang1 = iso639AllCodes[this.langRefName].alpha2

    return this
  }

  equals(otherNode) {
    return this.source === otherNode.source
  }

  toString() {
    return JSON.stringify(this)
  }
}

export default ArborNode
