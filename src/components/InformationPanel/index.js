import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import classNames from 'classnames'
import { clearWord } from '../../redux/reducers/words'
import Definitions from '../Definitions'

import bookLoading from '../../assets/book-loading.gif'
import './index.scss'

function InformationPanel() {
  const [showInfo, setShowInfo] = useState(false)
  const { loading, word } = useSelector((state) => state.words)
  const { source } = useSelector((state) => state.tree)
  const dispatch = useDispatch()

  const handleMouseOver = () => {
    setShowInfo(true)
  }

  const handleMouseLeave = () => {
    setShowInfo(false)
  }

  useEffect(() => {
    dispatch(clearWord())
  }, [dispatch, source])

  return (
    <div className={`information-panel ${source ? 'show' : ''}`}>
      <div className="contents">
        <div
          className={`info-hover ${word ? 'show' : ''}`}
          onMouseOver={handleMouseOver}
          onMouseLeave={handleMouseLeave}
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
