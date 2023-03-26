import { createSlice } from "@reduxjs/toolkit";

const wordsSlice = createSlice({
  name: 'words',
  initialState: {
    word: null,
    loading: false,
  },
  reducers: {
    clearWord(state) {
      state.word = null
    },
    setWord(state, action) {
      const word = action.payload

      if (word && typeof word === 'string') {
        state.word = word
      }
    },
    startLoading(state) {
      state.loading = true
    },
    finishLoading(state) {
      state.loading = false
    },
  }
})

export const {
  clearWord,
  resetOptions,
  setWord,
  startLoading,
  finishLoading,
} = wordsSlice.actions

export default wordsSlice.reducer
