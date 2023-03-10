import classNames from "classnames"
import { useSelector } from "react-redux"

import './index.scss'

function Loading() {
  const { seed } = useSelector((state) => state.words)
  const { error, loading } = useSelector((state) => state.ui)

  return (
    <div className={classNames('status', { error })}>
      {loading ? 'Building tree...'
        : error ? error
        : seed ? `Done building tree for "${seed}".`
        : 'Ready.'}
    </div>
  )
}

export default Loading
