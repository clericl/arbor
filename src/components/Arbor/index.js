import { useCallback, useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { ingestionFailed } from "../../redux/actions"
import { setWord } from "../../redux/reducers/words"
import Chart from "../../utils/Chart"

import './index.scss'

function Arbor() {
  const [chartInit, setChartInit] = useState(false)
  const [data, setData] = useState([])

  const { nodes, links, source } = useSelector((state) => state.network)

  const chartRef = useRef(null)
  const nodeRef = useRef(null)

  const dispatch = useDispatch()

  const handleSelectNode = useCallback((_, datum) => {
    dispatch(setWord(datum?.data?.source))
  }, [dispatch])

  // useEffect(() => {
  //   if (trunkGenerated) {
  //     setData(trunk.concat(branches))
  //   }
  // }, [trunk, trunkGenerated, branches])

  // useEffect(() => {
  //   if (chartRef.current && chartInit) {
  //     if (chartRef.current.svg && data.length) {
  //       const statusObj = chartRef.current.ingestData(data)

  //       if (!statusObj.hasError) {
  //         chartRef.current.updateTree()
  //       } else {
  //         dispatch(ingestionFailed(statusObj))
  //       }
  //     }
  //   }
  // }, [chartInit, data, dispatch])

  // useEffect(() => {
  //   if (seed) {
  //     chartRef.current = new Chart(nodeRef.current, handleSelectNode)
  //     chartRef.current.initTree()
        
  //     setChartInit(true)
  //   } else {
  //     if (chartRef.current) {
  //       chartRef.current.destroyTree()
  //       chartRef.current = null
  //     }
  //   }

  //   return () => {
  //     if (chartRef.current) {
  //       chartRef.current.destroyTree()
  //     }
  //   }
  // }, [handleSelectNode, seed])

  return (
    <div className="arbor-chart" ref={nodeRef}></div>
  )
}

export default Arbor
