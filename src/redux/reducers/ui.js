import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    error: null,
    showInitialMessage: true,
  },
  reducers: {
    clearError(state) {
      state.error = null
    },
    clearInitialMessage(state) {
      state.showInitialMessage = false
    },
    setError(state, action) {
      state.error = action.payload
    },
    showInitialMessage(state) {
      state.showInitialMessage = true
    }
  }
})

export const {
  clearError,
  clearInitialMessage,
  setError,
  showInitialMessage,
} = uiSlice.actions

export default uiSlice.reducer
