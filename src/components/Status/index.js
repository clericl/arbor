import classNames from "classnames"
import { useSelector } from "react-redux"

import bookLoading from '../../assets/book-loading.gif'
import './index.scss'

function Status() {
  const { done, source } = useSelector((state) => state.tree)
  const { error } = useSelector((state) => state.ui)

  return (
    <div className={classNames('status', { error })}>
      {!done ? 'Building network...'
        : error ? error
        : source ? `Done building network for "${source}".`
        : 'Ready.'}
      {true && (
        <span className={classNames('loader', { hidden: done })}>
          <img src={bookLoading} alt="loading definitions" />
        </span>
      )}
    </div>
  )
}

export default Status
