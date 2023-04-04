import classNames from "classnames"
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
  const { showInitialMessage } = useSelector((state) => state.ui)

  const { done, nodes, source } = useSelector((state) => state.tree)

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
    if (chartRef.current && chartInit) {
      chartRef.current.done = done
    }
  }, [chartInit, done])

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
    <>
      <div className={classNames('arbor-chart', { hidden: showInitialMessage })} ref={nodeRef}></div>
      <div className={classNames('initial-message', { hidden: !showInitialMessage })}>
        <span>
          This is Arbor, a tool to visualize word etymology.
        </span>
        <span>
          Enter a word below to see its ancestors and other connected words.
        </span>
        <span>
          Use the language selector to the bottom left to search for words from around the world.
        </span>
        <span>
          Not sure what word to pick? Go random!
        </span>
      </div>
    </>
  )
}

export default Arbor
