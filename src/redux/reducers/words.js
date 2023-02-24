import { createSlice } from "@reduxjs/toolkit";
import isEqual from 'lodash.isequal'

const treeSlice = createSlice({
  name: 'tree',
  initialState: {
    trunk: [],
    branches: [],
  },
  reducers: {
    growTrunk(state, action) {
      const newTrunk = [
        ...state.trunk,
        ...action.payload,
      ]

      const newSet = new Set(newTrunk)
      
      state.trunk = Array.from(newSet)
    },
    growBranches(state, action) {
      const newBranches = state.branches.slice()

      action.payload.forEach((newNode) => {
        if (!newBranches.find((oldNode) => isEqual(oldNode, newNode))) {
          newBranches.push(newNode)
        }
      })
      
      state.branches = newBranches
    },
    resetTree(state) {
      state.trunk = []
      state.branches = []
    },
  }
})

export const {
  growTrunk,
  growBranches,
  resetTree,
} = treeSlice.actions

export default treeSlice.reducer
