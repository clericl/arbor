import { createSlice } from "@reduxjs/toolkit";

const defaultOptions = {
  lang: 'English',
  filterHomographs: true,
}

const wordsSlice = createSlice({
  name: 'words',
  initialState: {
    word: null,
    options: defaultOptions,
  },
  reducers: {
    clearWord(state) {
      state.word = null
    },
    resetOptions(state) {
      state.options = defaultOptions
    },
    setFilterHomographs(state, action) {
      state.options.filterHomographs = action.payload
    },
    setLang(state, action) {
      state.options.lang = action.payload
    },
    setOptions(state, action) {
      state.options = action.payload
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
  resetOptions,
  setFilterHomographs,
  setLang,
  setOptions,
  setWord,
} = wordsSlice.actions

export default wordsSlice.reducer
