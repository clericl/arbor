import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useMediaQuery } from '../../utils/useMediaQuery.ts'
import classNames from 'classnames'
import { clearWord } from '../../redux/reducers/words'
import Definitions from '../Definitions'

import bookLoading from '../../assets/book-loading.gif'
import './index.scss'

function InformationPanel() {
  const [showInfo, setShowInfo] = useState(false)
  const [boxOpen, setBoxOpen] = useState(true)
  const { loading, word } = useSelector((state) => state.words)
  const { source } = useSelector((state) => state.tree)
  const dispatch = useDispatch()

  const isDesktop = useMediaQuery('(min-width:768px)')

  const handleMouseOver = () => {
    if (isDesktop) {
      setShowInfo(true)
    }
  }

  const handleMouseLeave = () => {
    if (isDesktop) {
      setShowInfo(false)
    }
  }

  const handleClick = () => {
    if (!isDesktop) {
      setShowInfo(!showInfo)
    }
  }

  const toggleOpen = () => {
    setBoxOpen(!boxOpen)
  }

  useEffect(() => {
    dispatch(clearWord())
  }, [dispatch, source])

  return (
    <div
      className={classNames(
        'information-panel',
        {
          show: source,
          open: boxOpen,
        },
      )}
    >
      {!isDesktop && word && (
        <div
          className={
            classNames(
              'mobile-arrow',
              { open: boxOpen }
            )
          }
          onClick={toggleOpen}
        >
          <span className="material-symbols-outlined">expand_more</span>
        </div>
      )}
      <div className="contents">
        <div
          className={`info-hover ${word ? 'show' : ''}`}
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <span className="material-symbols-outlined">
            info
          </span>
        </div>
        <div className={classNames(
          'info-content',
          {
            absolute: !!word,
            open: showInfo,
          }
        )}>
          Click on a node to view details and definitions for that word.
        </div>
        {word && (
          <>
            <div className={classNames('loader', { hidden: !loading })}>
              <img src={bookLoading} alt="loading definitions" />
            </div>
            <div className={`definitions-container ${showInfo ? 'hidden' : ''}`}>
              <Definitions />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default InformationPanel
