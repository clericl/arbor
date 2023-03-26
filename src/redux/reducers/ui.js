import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    error: null,
  },
  reducers: {
    setError(state, action) {
      state.error = action.payload
    },
    clearError(state) {
      state.error = null
    },
  }
})

export const {
  
  setError,
  clearError
} = uiSlice.actions

export default uiSlice.reducer
