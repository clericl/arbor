import BigQuery from '../../utils/BigQuery'
import { all, call, put, takeLatest } from 'redux-saga/effects'
import { branchesGenerated, fetchChildrenFailed, fetchChildrenSucceeded, fetchingChildren, fetchingParents, fetchParentsFailed, fetchParentsSucceeded, plantSeed, requestFetchParents, treeGenerated, trunkGenerated } from '../actions'

function* fetchParents(nodeOrSource) {
  console.log(nodeOrSource)
  const source = typeof nodeOrSource === 'string' ? nodeOrSource : nodeOrSource.source

  yield put(fetchingParents())

  try {
    const data = yield call([BigQuery, 'fetchParents'], source)
    yield put(fetchParentsSucceeded(data))

    return data
  } catch (e) {
    yield put(fetchParentsFailed(e))
  }
}

function* fetchChildren(nodeOrSource) {
  console.log(nodeOrSource)
  const source = typeof nodeOrSource === 'string' ? nodeOrSource : nodeOrSource.source

  yield put(fetchingChildren())

  try {
    const data = yield call([BigQuery, 'fetchChildren'], source)
    yield put(fetchChildrenSucceeded(data))

    return data
  } catch (e) {
    yield put(fetchChildrenFailed(e))
  }
}

function* extendTrunk(node) {
  let branch = [node]
  let canExtend = true

  while (canExtend) {
    const nextParentData = yield call(fetchParents, branch[branch.length - 1].source)

    if (nextParentData?.meta?.count) {
      if (nextParentData.meta.count > 1) {
        for (const datum of nextParentData.data) {
          const newNode = {
            source: datum.target,
            relation: 'rel:etymological_origin_of',
            target: datum.source,
          }
          const newBranch = yield call(extendTrunk, newNode)
          branch = branch.concat(newBranch)
        }
      } else {
        branch.push({
          source: nextParentData.data[0].target,
          relation: 'rel:etymological_origin_of',
          target: nextParentData.data[0].source,
        })
      }
    } else {
      canExtend = false
    }
  }

  return branch
}

function* extendBranch(node, ignore) {
  let branch = []
  const childrenData = yield call(fetchChildren, node.source)

  if (childrenData?.meta?.count) {
    for (const datum of childrenData.data) {
      if (!ignore.find((oldNode) => {
        return (
          oldNode.source === datum.source &&
          oldNode.target === datum.target
          ) || (
          oldNode.target === datum.source &&
          oldNode.source === datum.target
        )
      })) {
        branch.push(datum)
        const newBranch = yield call(extendBranch, datum, ignore)
        branch = branch.concat(newBranch)
      }
    }
  }

  return branch
}

function* buildTree(action) {
  if (!action.payload) return false

  const baseNode = {
    source: action.payload,
    relation: 'rel:seed',
    target: null,
  }

  const trunk = yield call(extendTrunk, baseNode)
  yield put(trunkGenerated(trunk))

  let branches = []

  for (const node of trunk) {
    const newBranch = yield call(extendBranch, node, trunk)
    branches = branches.concat(newBranch)
  }
  
  yield put(branchesGenerated(branches))
}

function* watchPlantSeed() {
  yield takeLatest(plantSeed, buildTree)
}

function* rootSaga() {
  yield all([
    watchPlantSeed(),
  ])
}

export default rootSaga
