class BigQuery {
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
