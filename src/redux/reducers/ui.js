import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    error: null,
    loading: false,
  },
  reducers: {
    startLoading(state) {
      state.loading = true
    },
    finishLoading(state) {
      state.loading = false
    },
    setError(state, action) {
      state.error = action.payload
    },
    clearError(state) {
      state.error = null
    },
  }
})

export const {
  startLoading,
  finishLoading,
  setError,
  clearError
} = uiSlice.actions

export default uiSlice.reducer
