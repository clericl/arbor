import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Wiktionary from '../../utils/Wiktionary'

import iso639_3 from '../../utils/iso639-3.json'
import './index.scss'

function Definitions() {
  const [value, setValue] = useState('')
  const [data, setData] = useState('')
  const { word } = useSelector((state) => state.words)

  const handleInput = (e) => {
    setValue(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const def = await Wiktionary.getEtymologies(
      value.split(': ')[1],
      iso639_3[value.split(': ')[0]])

    setData(def)
  }

  useEffect(() => {
    // const queryWord = async () => {
    //   const parser = new Wiktionary()

    //   const [langCode, baseWord] = word.split(': ')
    //   const lang = iso[langCode]

    //   const result = await parser.query(baseWord, lang)
    //   console.log(result)
    // }

    // if (word) {
    //   queryWord()
    // }
  }, [word])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <form onSubmit={handleSubmit}>
        <input onInput={handleInput} value={value} />
      </form>
      <div>{JSON.stringify(data, null, 2)}</div>
    </div>
  )
}

export default Definitions
