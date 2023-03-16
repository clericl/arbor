class BigQuery {
  static async fetchNetwork(source){
    const res = await fetch(process.env.REACT_APP_API_ENDPOINT + '/networks/' + source)
    const body = await res.json()
    return body
  }

  static async saveNetwork(network){
    const res = await fetch(process.env.REACT_APP_API_ENDPOINT + '/networks', {
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

  static async fetchDescendants(seed) {
    const res = await fetch(process.env.REACT_APP_API_ENDPOINT + '/descendants/' + seed)
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
