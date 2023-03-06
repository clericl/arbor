import { createSlice } from "@reduxjs/toolkit";

const treeSlice = createSlice({
  name: 'tree',
  initialState: {
    trunk: [],
    branches: [],
    trunkGenerated: false,
    branchesGenerated: false,
  },
  reducers: {
    addToBranches(state, action) {
      const datum = action.payload
      if (!state.branches.find((compNode) => {
        return (
          compNode.source === datum.source &&
          compNode.target === datum.target
          ) || (
          compNode.target === datum.source &&
          compNode.source === datum.target
        )
      })) {
        state.branches.push(datum)
      }
    },
    updateTrunk(state, action) {
      state.trunk = action.payload
    },
    updateBranches(state, action) {
      state.branches = action.payload
    },
    resetTree(state) {
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
  addToBranches,
  branchesGenerated,
  updateBranches,
  updateTrunk,
  resetTree,
  trunkGenerated,
} = treeSlice.actions

export default treeSlice.reducer
