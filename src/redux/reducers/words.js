import { createSlice } from "@reduxjs/toolkit";

const wordsSlice = createSlice({
  name: 'words',
  initialState: {
    word: null,
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
  }
})

export const {
  clearWord,
  setWord,
} = wordsSlice.actions

export default wordsSlice.reducer
