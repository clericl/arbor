import { useCallback, useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { ingestionFailed } from "../../redux/actions"
import { setWord } from "../../redux/reducers/words"
import ArborNode from "../../utils/ArborNode"
import Chart from "../../utils/Chart"

import './index.scss'

function Arbor() {
  const [chartInit, setChartInit] = useState(false)
  const [data, setData] = useState([])

  const { nodes, source } = useSelector((state) => state.tree)

  const chartRef = useRef(null)
  const nodeRef = useRef(null)

  const dispatch = useDispatch()

  const handleSelectNode = useCallback((_, datum) => {
    dispatch(setWord(datum?.data?.source))
  }, [dispatch])

  useEffect(() => {
    if (source) {
      const seedNode = new ArborNode(source, null, 'rel:seed')
      const nodesArr = nodes.map((node) => new ArborNode(node))
      nodesArr.push(seedNode)
      setData(nodesArr)
    }
  }, [nodes, source])

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
    if (source) {
      chartRef.current = new Chart(nodeRef.current, handleSelectNode)
      chartRef.current.initTree()
        
      setChartInit(true)
    } else {
      if (chartRef.current) {
        chartRef.current.destroyTree()
        chartRef.current = null
      }
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroyTree()
      }
    }
  }, [handleSelectNode, source])

  return (
    <div className="arbor-chart" ref={nodeRef}></div>
  )
}

export default Arbor
