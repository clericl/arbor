import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { cancelTree, requestTree } from "../../redux/actions"
import { setTreeBuilding } from "../../redux/reducers/tree"
import Status from '../Status'
import BigQuery from "../../utils/BigQuery"
import ArborNode from "../../utils/ArborNode"

import iso639AllCodes from '../../utils/iso639AllCodes.json'
import './index.scss'

const langOpts = Object.keys(iso639AllCodes).sort().map((lang) => (
  <option className="lang-option" key={lang} value={iso639AllCodes[lang].alpha3}>{lang}</option>
))

function Input() {
  const [lang, setLang] = useState('eng')
  const [value, setValue] = useState('')
  const { done } = useSelector((state) => state.tree)
  const dispatch = useDispatch()
  const ref = useRef()

  const handleChange = (e) => {
    setLang(e.target.value)
  }

  const handleInput = (e) => {
    setValue(e.target.value)
  }

  const handleRandom = async () => {
    setValue('Randomizing...')
    dispatch(setTreeBuilding())

    const res = await BigQuery.getRandomSeed()
    const randomSeed = res?.data?.[0]
    const randomSeedNode = new ArborNode(randomSeed, null, "rel:seed")

    setLang(randomSeedNode.sourceLang.alpha3)
    setValue(randomSeedNode.sourceWord)

    submit(randomSeedNode.sourceLang.alpha3, randomSeedNode.sourceWord)
  }

  const submit = (lang, value) => {
    dispatch(requestTree(`${lang}: ${value}`))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    submit(lang, value)
    ref.current.blur()
  }

  const handleCancel = () => {
    dispatch(cancelTree())
  }

  useEffect(() => {
    ref.current.focus()
  }, [])

  return (
    <div className="input">
      <Status />
      {done && (
        <button className="random-button" onClick={handleRandom}>
          Random me!
        </button>
      )}
      <form className="input-form" onSubmit={handleSubmit}>
        <input
          className="input"
          disabled={!done}
          onInput={handleInput}
          placeholder="Enter your word here."
          value={value}
          ref={ref}
        />
        <select className="lang-select" value={lang} onChange={handleChange}>
          {langOpts}
        </select>
      </form>
      {!done && (
        <button className="cancel-button" onClick={handleCancel}>
          <span className="material-symbols-outlined">
            close
          </span>
        </button>
      )}
    </div>
  )
}

export default Input
