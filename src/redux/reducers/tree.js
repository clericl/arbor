import { createSlice } from "@reduxjs/toolkit";

const defaultOptions = {
  lang: 'English',
  descendantsLimit: 20,
  filterHomographs: true,
}

const treeSlice = createSlice({
  name: 'tree',
  initialState: {
    source: null,
    nodes: [],
    options: defaultOptions,
  },
  reducers: {
    addNode(state, action) {
      const newNode = action.payload
      const nodesSet = new Set(state.nodes)
      nodesSet.add(newNode)
      state.nodes = Array.from(nodesSet)
    },
    resetOptions(state) {
      state.options = defaultOptions
    },
    resetTree(state) {
      state.source = null
      state.nodes = []
    },
    setFilterHomographs(state, action) {
      state.options.filterHomographs = action.payload
    },
    setLang(state, action) {
      state.options.lang = action.payload
    },
    setNodes(state, action) {
      state.nodes = action.payload
    },
    setOptions(state, action) {
      state.options = action.payload
    },
    setSource(state, action) {
      state.source = action.payload
    },
  }
})

export const {
  addNode,
  resetTree,
  setFilterHomographs,
  setLang,
  setNodes,
  setOptions,
  setSource,
} = treeSlice.actions

export default treeSlice.reducer
