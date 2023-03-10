import { createSlice } from "@reduxjs/toolkit";

const treeSlice = createSlice({
  name: 'tree',
  initialState: {
    seed: null,
    trunk: [],
    branches: [],
    trunkGenerated: false,
    branchesGenerated: false,
  },
  reducers: {
    setSeed(state, action) {
      state.seed = action.payload
    },
    addToBranches(state, action) {
      const datum = action.payload
      if (!state.branches.concat(state.trunk).find((compNode) => {
        return (
          compNode.source === datum.source &&
          compNode.target === datum.target
          ) || (
          compNode.target === datum.source &&
          compNode.source === datum.target
        ) || (
          compNode.source === datum.source &&
          compNode.target !== datum.target &&
          compNode.relation === 'rel:etymology'
        )
      })) {
        state.branches.push(datum)
      }
    },
    removeFromBranches(state, action) {
      const targetNode = action.payload
      const targetIndex = state.branches.findIndex((compNode) => (
        targetNode.source === compNode.source &&
        targetNode.relation === compNode.relation &&
        targetNode.target === compNode.target
      ))

      const newBranches = state.branches.slice()
      newBranches.splice(targetIndex, 1)

      state.branches = newBranches
    },
    updateTrunk(state, action) {
      state.trunk = action.payload
    },
    updateBranches(state, action) {
      state.branches = action.payload
    },
    resetTree(state) {
      state.seed = null
      state.trunk = []
      state.branches = []
    },
    trunkGenerated(state) {
      state.trunkGenerated = true
    },
    branchesGenerated(state) {
      state.branchesGenerated = true
    },
  }
})

export const {
  setSeed,
  addToBranches,
  branchesGenerated,
  updateBranches,
  updateTrunk,
  removeFromBranches,
  resetTree,
  trunkGenerated,
} = treeSlice.actions

export default treeSlice.reducer
