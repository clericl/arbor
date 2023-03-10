import { useCallback, useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { plantSeed } from "../../redux/actions"

import iso from '../../utils/iso.json'
import './index.scss'

function Input() {
  const [lang, setLang] = useState('eng')
  const [value, setValue] = useState('')
  const { loading } = useSelector((state) => state.ui)
  const dispatch = useDispatch()
  const ref = useRef()

  const handleChange = (e) => {
    setLang(e.target.value)
  }

  const handleInput = (e) => {
    setValue(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    dispatch(plantSeed(`${lang}: ${value}`))
    ref.current.blur()
  }

  const renderLangOptions = useCallback(() => Object.entries(iso).sort((a, b) => a[1] > b[1]).map(([key, value]) => (
    <option className="lang-option" key={key} value={key}>{value}</option>
  )), [])

  useEffect(() => {
    ref.current.focus()
  }, [])

  return (
    <form className="input-form" onSubmit={handleSubmit}>
      <input
        className="input"
        disabled={loading}
        onInput={handleInput}
        placeholder="Enter your word here."
        value={value}
        ref={ref}
      />
      <select className="lang-select" value={lang} onChange={handleChange}>
        {renderLangOptions()}
      </select>
    </form>
  )
}

export default Input
