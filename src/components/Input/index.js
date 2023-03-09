import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { plantSeed } from "../../redux/actions"

import './index.scss'

function Input() {
  const [value, setValue] = useState('')
  const { loading } = useSelector((state) => state.ui)
  const dispatch = useDispatch()
  const ref = useRef()

  const handleInput = (e) => {
    setValue(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    dispatch(plantSeed(`eng: ${value}`))
    ref.current.blur()
  }

  useEffect(() => {
    if (!loading) {
      ref.current.focus()
    }
  }, [loading])

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
    </form>
  )
}

export default Input
