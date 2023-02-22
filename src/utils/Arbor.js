class Arbor {
  static async fetchRelations(seed) {
    const res = await fetch(process.env.REACT_APP_API_ENDPOINT + '/relation/' + seed)
    const body = await res.json()
    return body
  }

  static async fetchParents(seed) {
    const res = await fetch(process.env.REACT_APP_API_ENDPOINT + '/parents/' + seed)
    const body = await res.json()
    return body
  }

  static async fetchChildren(seed) {
    const res = await fetch(process.env.REACT_APP_API_ENDPOINT + '/children/' + seed)
    const body = await res.json()
    return body
  }

  static async fetchAll(seed) {
    const res = await fetch(process.env.REACT_APP_API_ENDPOINT + '/all/' + seed)
    const body = await res.json()
    return body
  }

  static async extendTrunk(node) {
    let branch = [node]
    let canExtend = true

    while (canExtend) {
      const nextParentData = await this.fetchParents(branch[branch.length - 1].source)
      
      if (nextParentData?.meta?.count) {
        if (nextParentData.meta.count > 1) {
          for await (const datum of nextParentData.data) {
            const newBranch = await this.extendTrunk({
              source: datum.source,
              parent: datum.target
            })
            branch = branch.concat(newBranch)
          }
        } else {
          branch.push({
            source: nextParentData.data[0].source,
            parent: nextParentData.data[0].target
          })
        }
      } else {
        canExtend = false
      }
    }

    return branch
  }

  static async extendBranch(node, branch) {
    console.log(node)
    const childrenData = await Arbor.fetchChildren(node.source)

    if (childrenData?.meta?.count) {
      for await (const datum of childrenData.data) {
        const nodeFromDatum = {
          source: datum.source,
          parent: datum.target
        }
        if (!branch.find((oldNode) => (oldNode.source === nodeFromDatum.source && oldNode.target === nodeFromDatum.target))) {
          branch.push(nodeFromDatum)
          await Arbor.extendBranch(nodeFromDatum, branch)
        }
      }
    }
  }

  constructor(seed) {
    this.setSeed(seed)
  }

  setSeed(seed) {
    this.seed = seed
    this.trunk = []
    this.branches = []
    this.tree = []
  }

  async generateTrunk() {
    const baseNode = {
      source: this.seed,
      parent: null
    }

    this.trunk = await Arbor.extendTrunk(baseNode)
    return this.trunk
  }

  async generateBranches() {
    this.branches = this.branches.concat(this.trunk)

    for await (const node of this.trunk) {
      await Arbor.extendBranch(node, this.branches)
    }

    this.tree = this.branches
    return this.tree
  }

  async generateTree() {
    await this.generateTrunk()
    await this.generateBranches()
    
    return this.tree
  }
}

export default Arbor
