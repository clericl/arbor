import Definitions from '../Definitions'

import bookLoading from '../../assets/book-loading.gif'
import './index.scss'
import { useSelector } from 'react-redux'

function InformationPanel() {
  const { done } = useSelector((state) => state.tree)
  const { loading, } = useSelector((state) => state.words)

  return (
    <div className="information-panel">
      <div className="contents">
        <div className={`loader ${(loading || !done) ? "" : "hidden"}`}>
          <img src={bookLoading} alt="loading definitions" />
        </div>
        <Definitions />
      </div>
    </div>
  )
}

export default InformationPanel
