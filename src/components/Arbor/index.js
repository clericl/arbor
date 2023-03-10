import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { ingestionFailed } from "../../redux/actions"
import Chart from "../../utils/Chart"

import './index.scss'

function Arbor() {
  const [chartInit, setChartInit] = useState(false)
  const [data, setData] = useState([])
  const { seed } = useSelector((state) => state.words)
  const chartRef = useRef(null)
  const nodeRef = useRef(null)
  const dispatch = useDispatch()
  const { branches, trunk, trunkGenerated } = useSelector((state) => state.words)

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
    if (seed) {
      chartRef.current = new Chart(nodeRef.current)
      chartRef.current.initTree()
        
      setChartInit(true)
    } else {
      if (chartRef.current) {
        chartRef.current.destroyTree()
        // chartRef.current = null
      }
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroyTree()
      }
    }
  }, [seed])

  return (
    <div className="arbor-chart" ref={nodeRef}></div>
  )
}

export default Arbor
