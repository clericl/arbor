import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { plantSeed } from "../../redux/actions"

function Arbor() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(plantSeed('eng: check'))
  }, [dispatch])

  return (
    <div>hi</div>
  )
}

export default Arbor
