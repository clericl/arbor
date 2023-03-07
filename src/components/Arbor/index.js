import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { ingestionFailed, plantSeed } from "../../redux/actions"
import Chart from "../../utils/Chart"

import './index.css'

function Arbor() {
  const [chartInit, setChartInit] = useState(false)
  const [data, setData] = useState([])
  const chartRef = useRef(null)
  const nodeRef = useRef(null)
  const dispatch = useDispatch()
  const { branches, trunk, trunkGenerated } = useSelector((state) => state.words)

  useEffect(() => {
    dispatch(plantSeed('eng: dime'))
  }, [dispatch])

  useEffect(() => {
    if (trunkGenerated) {
      setData(trunk.concat(branches))
    }
  }, [trunk, trunkGenerated, branches])

  useEffect(() => {
    if (chartRef.current && chartInit) {
      if (chartRef.current.svg && data.length) {
        const statusObj = chartRef.current.ingestData(data)

        if (!statusObj.hasError) {
          chartRef.current.updateTree()
        } else {
          dispatch(ingestionFailed(statusObj))
        }
      }
    }
  }, [chartInit, data, dispatch])

  useEffect(() => {
    chartRef.current = new Chart(nodeRef.current)
    chartRef.current.initTree()
      
    setChartInit(true)

    return () => {
      chartRef.current.destroyTree()
    }
  }, [])

  return (
    <div className="arbor-chart" ref={nodeRef}></div>
  )
}

export default Arbor
