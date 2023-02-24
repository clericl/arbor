import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { plantSeed } from "../../redux/actions"
import Chart from "../../utils/Chart"

function Arbor() {
  const [data, setData] = useState([])
  const chartRef = useRef(null)
  const nodeRef = useRef(null)
  const dispatch = useDispatch()
  const { trunk, branches } = useSelector((state) => state.words)

  useEffect(() => {
    dispatch(plantSeed('eng: blue'))
  }, [dispatch])

  useEffect(() => {
    setData(trunk.concat(branches))
  }, [trunk, branches])

  useEffect(() => {
    if (chartRef.current) {
      if (chartRef.current.svg) {
        console.log('here')
      } else if (data.length) {
        console.log(data)
        chartRef.current.initTree(data)
      }
    }
  }, [data])

  useEffect(() => {
    chartRef.current = new Chart(nodeRef.current)
  }, [])

  return (
    <div ref={nodeRef}></div>
  )
}

export default Arbor
