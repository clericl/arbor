import { createSlice } from "@reduxjs/toolkit";

const networkSlice = createSlice({
  name: 'network',
  initialState: {
    source: null,
    nodes: [],
    links: [],
  },
  reducers: {
    addLink(state, action) {
      const newLink = action.payload
      const linksSet = new Set(state.links)
      linksSet.add(newLink)
      state.links = Array.from(linksSet)
    },
    addNode(state, action) {
      const newNode = action.payload
      const nodesSet = new Set(state.nodes)
      nodesSet.add(newNode)
      state.nodes = Array.from(nodesSet)
    },
    resetNetwork(state) {
      state.source = null
      state.nodes = []
      state.links = []
    },
    setLinks(state, action) {
      state.links = action.payload
    },
    setNodes(state, action) {
      state.nodes = action.payload
    },
    setSource(state, action) {
      state.source = action.payload
    },
  }
})

export const {
  addLink,
  addNode,
  resetNetwork,
  setLinks,
  setNodes,
  setSource,
} = networkSlice.actions

export default networkSlice.reducer
