import { createSlice } from "@reduxjs/toolkit";

const wordsSlice = createSlice({
  name: 'words',
  initialState: {
    data: [],
  },
  reducers: {
    updateData(state, action) {
      state.data = action.payload
    }
  }
})

export const {
  updateData
} = wordsSlice.actions

export default wordsSlice.reducer
