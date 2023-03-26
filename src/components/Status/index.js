import classNames from "classnames"
import { useSelector } from "react-redux"

import './index.scss'

function Status() {
  const { done, source } = useSelector((state) => state.tree)
  const { error } = useSelector((state) => state)

  return (
    <div className={classNames('status', { error })}>
      {!done ? 'Building network...'
        : error ? error
        : source ? `Done building network for "${source}".`
        : 'Ready.'}
    </div>
  )
}

export default Status
