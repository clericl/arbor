import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { cancelTree, requestTree } from "../../redux/actions"

import iso639_1 from '../../utils/iso639-1.json'
import iso639AllCodes from '../../utils/iso639AllCodes.json'
import './index.scss'

const langOpts = Object.values(iso639_1).sort().map((lang) => (
  <option className="lang-option" key={lang} value={iso639AllCodes[lang].alpha3}>{lang}</option>
))

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

    dispatch(requestTree(`${lang}: ${value}`))
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
          {langOpts}
        </select>
      </form>
      {loading && (
        <button className="cancel-button" onClick={handleCancel}>
          &times;
        </button>
      )}
    </div>
  )
}

export default Input
