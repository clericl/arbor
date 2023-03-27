import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { animated, useSpring } from '@react-spring/web'
import { finishLoading, startLoading } from '../../redux/reducers/words'
import ArborNode from '../../utils/ArborNode'
import Wiktionary from '../../utils/Wiktionary'

import './index.scss'

function PartOfSpeech({
  definitions,
  isOpenSection,
  partOfSpeech,
  setOpenSection,
}) {
  const heightRef = useRef(0)
  const olRef = useRef()
  const [styles, api] = useSpring(() => ({
    from: { height: heightRef.current },
    config: {
      friction: 26,
    }
  }))

  const renderDefinitions = () => (
    definitions.map((definition) => definition ? (
      <li key={definition} dangerouslySetInnerHTML={{ __html: definition }}></li>
    ) : null)
  )

  const toggleOpenSection = () => {
    setOpenSection(isOpenSection ? '' : partOfSpeech)
  }

  useEffect(() => {
    heightRef.current = olRef.current.offsetHeight
  }, [])

  useEffect(() => {
    if (isOpenSection) {
      api.start({
        to: { height: heightRef.current }
      })
    } else {
      api.start({
        to: { height: 0 }
      })
    }
  }, [api, isOpenSection])

  useEffect(() => {
    api.set({ height: 0 })
  }, [api, definitions])

  return (
    <div className="part-of-speech" key={partOfSpeech}>
      <h3 onClick={toggleOpenSection}>
        {partOfSpeech}
        <span className={`material-symbols-outlined arrow ${isOpenSection ? "less" : "more"}`}>expand_more</span>
      </h3>
      <animated.div style={styles}>
        <ol ref={olRef}>{renderDefinitions()}</ol>
      </animated.div>
    </div>
  )
}

function Definitions() {
  const [data, setData] = useState(new Map())
  const [openSection, setOpenSection] = useState('')
  const { word } = useSelector((state) => state.words)
  const { loading } = useSelector((state) => state.words)
  const { done } = useSelector((state) => state.tree)
  const wordNode = useMemo(() => word ? new ArborNode(word, null, "rel:seed") : null, [word])
  const dispatch = useDispatch()

  const renderPartsOfSpeech = useCallback(() => {
    const elements = []

    data.forEach((definitions, partOfSpeech) => {
      const isOpenSection = openSection === partOfSpeech

      elements.push(
        <PartOfSpeech
          key={partOfSpeech}
          definitions={definitions}
          partOfSpeech={partOfSpeech}
          isOpenSection={isOpenSection}
          setOpenSection={setOpenSection}
        />
      )
    })

    return elements
  }, [data, openSection])

  useEffect(() => {
    setOpenSection('')

    const queryWord = async () => {
      const lang = wordNode.sourceLang.refName
      const sourceWord = wordNode.sourceWord

      const definitionRes = await Wiktionary.getDefinitionRes(sourceWord)
      const parsed = Wiktionary.parseDefinitionRes(definitionRes, lang)

      setData(parsed)
      dispatch(finishLoading())
    }

    if (wordNode) {
      dispatch(startLoading())
      queryWord()
    }
  }, [dispatch, wordNode])

  return (
    <div className={`definitions ${(loading || !done) ? "hidden" : ""}`}>
      {wordNode && (
        <>
          <h2>{wordNode.sourceWord}</h2>
          <h4>{wordNode.sourceLang.refName}</h4>
          <div className="scroller">
            {data.size ? (
              renderPartsOfSpeech()
            ) : (
              <div className="not-found">No definitions found.</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Definitions
