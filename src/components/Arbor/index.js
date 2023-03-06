import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { plantSeed } from "../../redux/actions"
import Chart from "../../utils/Chart"

import './index.css'

function Arbor() {
  const [data, setData] = useState([])
  const chartRef = useRef(null)
  const nodeRef = useRef(null)
  const dispatch = useDispatch()
  const { branches, trunk, trunkGenerated } = useSelector((state) => state.words)

  useEffect(() => {
    dispatch(plantSeed('eng: goose'))
  }, [dispatch])

  useEffect(() => {
    if (trunkGenerated) {
      setData(trunk.concat(branches))
    }
  }, [trunk, trunkGenerated, branches])

  useEffect(() => {
    if (chartRef.current) {
      if (chartRef.current.svg) {
        chartRef.current.updateTree(data)
      } else if (data.length) {
        chartRef.current.initTree(data)
      }
    }
  }, [data])

  useEffect(() => {
    chartRef.current = new Chart(nodeRef.current)
  }, [])

  return (
    <div className="arbor-chart" ref={nodeRef}></div>
  )
}

export default Arbor
