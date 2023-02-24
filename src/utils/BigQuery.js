class BigQuery {
  static async fetchTree(seed){
    const res = await fetch(process.env.REACT_APP_API_ENDPOINT + '/trees/' + seed)
    const body = await res.json()
    return body
  }

  static async saveTree(tree){
    const res = await fetch(process.env.REACT_APP_API_ENDPOINT + '/trees', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tree),
    })

    const body = await res.json()
    return body
  }

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
}

export default BigQuery
