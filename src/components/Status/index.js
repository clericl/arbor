import classNames from "classnames"
import { useSelector } from "react-redux"

import './index.scss'

function Status() {
  const { source } = useSelector((state) => state.network)
  const { error, loading } = useSelector((state) => state.ui)

  return (
    <div className={classNames('status', { error })}>
      {loading ? 'Building network...'
        : error ? error
        : source ? `Done building network for "${source}".`
        : 'Ready.'}
    </div>
  )
}

export default Status
