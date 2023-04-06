import { useEffect, useRef, useState } from "react"
import classNames from "classnames"
import { useDispatch, useSelector } from "react-redux"
import { useMediaQuery } from "../../utils/useMediaQuery.ts"
import { cancelTree, requestTree } from "../../redux/actions"
import { setTreeBuilding } from "../../redux/reducers/tree"
import { clearInitialMessage, showInitialMessage as showInitialMessageFn } from "../../redux/reducers/ui"
import Status from '../Status'
import BigQuery from "../../utils/BigQuery"
import ArborNode from "../../utils/ArborNode"

import iso639AllCodes from '../../utils/iso639AllCodes.json'
import './index.scss'

const langOpts = Object.keys(iso639AllCodes).sort().map((lang) => (
  <option className="lang-option" key={lang} value={iso639AllCodes[lang].alpha3}>{lang}</option>
))

const RandomButton = ({ done, handleRandom }) => (
  <div className={classNames('random-button-container', { disabled: !done })}>
    <div className="random-button" onClick={handleRandom}>
      <span className="material-symbols-outlined">
        magic_exchange
      </span>
      Random me!
    </div>
  </div>
)

function Input() {
  const [lang, setLang] = useState('eng')
  const [value, setValue] = useState('')
  const { done, source } = useSelector((state) => state.tree)
  const { showInitialMessage } = useSelector((state) => state.ui)
  const dispatch = useDispatch()
  const ref = useRef()

  const isDesktop = useMediaQuery('(min-width:768px)')

  const handleChange = (e) => {
    setLang(e.target.value)
  }

  const handleInput = (e) => {
    setValue(e.target.value)
  }

  const handleClick = () => {
    if (!isDesktop) {
      dispatch(showInitialMessage ? clearInitialMessage() : showInitialMessageFn())
    }
  }

  const handleMouseOver = () => {
    if (isDesktop) {
      dispatch(showInitialMessageFn())
    }
  }

  const handleMouseLeave = () => {
    if (isDesktop) {
      dispatch(clearInitialMessage())
    }
  }

  const handleRandom = async (e) => {
    e.preventDefault()
    
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
      <form className="input-form" onSubmit={handleSubmit}>
        <div className={classNames('lang-select-container', { disabled: !done })}>
          <select
            className="lang-select"
            disabled={!done}
            value={lang}
            onChange={handleChange}
          >
            {langOpts}
          </select>
        </div>
        <div className="input-box-container">
          <input
            className="input-box"
            disabled={!done}
            onInput={handleInput}
            placeholder="Enter a word"
            value={value}
            ref={ref}
          />
          <div
            className={classNames('search-bar-button-container', { disabled: done && !value })}
            onClick={done ? handleSubmit : handleCancel}
          >
            {done ? (
              <span className="material-symbols-outlined">
                search
              </span>
            ) : (
              <span className="material-symbols-outlined">
                close
              </span>
            )}
          </div>
          {!isDesktop && (
            <RandomButton done={done} handleRandom={handleRandom} />
          )}    
        </div>
        {isDesktop && (
          <RandomButton done={done} handleRandom={handleRandom} />
        )}
      </form>
      {source && (
        <div
          className="initial-message-hover"
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <span className="material-symbols-outlined">
            info
          </span>
        </div>
      )}
    </div>
  )
}

export default Input
