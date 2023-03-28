import { createSlice } from "@reduxjs/toolkit";

const defaultOptions = {
  lang: 'English',
  descendantsLimit: 25,
  filterHomographs: true,
  recurse: true,
  loadFromMemory: false,
}

const treeSlice = createSlice({
  name: 'tree',
  initialState: {
    done: true,
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
    setTreeBuilding(state) {
      state.done = false
    },
    setTreeDone(state) {
      state.done = true
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
  setTreeBuilding,
  setSource,
  setTreeDone,
} = treeSlice.actions

export default treeSlice.reducer
