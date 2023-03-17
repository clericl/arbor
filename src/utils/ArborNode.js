import Language from './Language'

class ArborNode {
  static areEqual(node, otherNode) {
    return (
      node.source === otherNode.source &&
      node.target === otherNode.target
    ) || (
      node.source === otherNode.target &&
      node.target === otherNode.source
    )
  }

  constructor(source, target, relation = 'rel:etymology') {
    if (typeof source === 'string') {
      this.source = source      
    } else if (typeof source === 'object' && source.source) {
      this.source = source.source
      this.relation = source.relation
    } else {
      throw new Error('Could not parse source.')
    }
    
    if (!target && source.target) {
      this.target = source.target
    } else if (!target && relation === 'rel:seed') {
      this.target = null
    } else if (typeof target === 'string') {
      this.target = target      
    } else if (typeof target === 'object' && target.source) {
      this.target = target.source
    } else {
      throw new Error('Could not parse target.')
    }

    if (!this.relation) {
      this.relation = relation
    }

    const sourceSplit = this.source.split(': ')
    const targetSplit = this.target ? this.target.split(': ') : ''

    this.sourceLang = new Language(sourceSplit[0])
    this.targetLang = targetSplit ? new Language(targetSplit[0]) : null
    this.sourceWord = sourceSplit[1].replace(/#/g, '')
    this.targetWord = targetSplit ? targetSplit[1].replace(/#/g, '') : null

    return this
  }

  equals(otherNode) {
    return (
      this.source === otherNode.source &&
      this.target === otherNode.target
    ) || (
      this.source === otherNode.target &&
      this.target === otherNode.source
    )
  }

  serialize() {
    return {
      source: this.source,
      target: this.target,
      relation: this.relation,
    }
  }

  toString() {
    return JSON.stringify(this.serialize())
  }
}

export default ArborNode
