class BigQuery {
  static async getRandomSeed(limit = 1) {
    const res = await fetch(process.env.REACT_APP_API_ENDPOINT + '/random/' + limit)
    const body = await res.json()
    return body
  }

  static async fetchTree(source){
    const res = await fetch(process.env.REACT_APP_API_ENDPOINT + '/trees/' + source)
    const body = await res.json()
    return body
  }

  static async saveTree(network){
    const res = await fetch(process.env.REACT_APP_API_ENDPOINT + '/trees', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(network),
    })

    const body = await res.json()
    return body
  }

  static async fetchRelations(seed) {
    const res = await fetch(process.env.REACT_APP_API_ENDPOINT + '/relations/' + seed)
    const body = await res.json()
    return body
  }

  static async fetchParents(seed) {
    const res = await fetch(process.env.REACT_APP_API_ENDPOINT + '/parents/' + seed)
    const body = await res.json()
    return body
  }

  static async fetchDescendants(seed, limit) {
    const res = await fetch(process.env.REACT_APP_API_ENDPOINT + '/descendants/' + seed + `?limit=${limit}`)
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
