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
  branchesGenerated,
  updateBranches,
  updateTrunk,
  resetTree,
  trunkGenerated,
} = treeSlice.actions

export default treeSlice.reducer
