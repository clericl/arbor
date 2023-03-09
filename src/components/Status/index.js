import { useSelector } from "react-redux"

function Loading() {
  const { loading } = useSelector((state) => state.ui)
  const { error } = useSelector((state) => state.words)

  return (
    loading ? (
      <div>Loading...</div>
    ) : error ? (
      <div>{error}</div>
    ) : (
      null
    )
  )
}

export default Loading
