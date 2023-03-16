import BigQuery from '../../utils/BigQuery'
import { all, call, cancel, delay, put, take, takeLatest } from 'redux-saga/effects'
import { ingestionFailed, fetchChildrenFailed, fetchChildrenSucceeded, fetchingChildren, fetchingParents, fetchingTree, fetchParentsFailed, fetchParentsSucceeded, fetchTreeFailed, fetchTreeSucceeded, plantSeed, saveTreeFailed, saveTreeSucceeded, savingTree, seedFailed, cancelSeed } from '../actions'
import { addToBranches, branchesGenerated, removeFromBranches, resetTree, setSeed, trunkGenerated, updateBranches, updateTrunk } from '../reducers/network'
import { clearError, finishLoading, setError, startLoading } from '../reducers/ui'

function* fetchTree(seed) {
  yield put(fetchingTree())

  try {
    const data = yield call([BigQuery, 'fetchTree'], seed)
    yield put(fetchTreeSucceeded())

    return data
  } catch(e) {
    console.error(e)
    yield put(fetchTreeFailed())
  }
}

function* saveTree(seed, trunk, branches) {
  yield put(savingTree())

  try {
    const data = yield call([BigQuery, 'saveTree'], { seed, trunk, branches })
    yield put(saveTreeSucceeded())

    return data
  } catch(e) {
    yield put(saveTreeFailed())
  }
}

function* fetchParents(nodeOrSource) {
  const source = typeof nodeOrSource === 'string' ? nodeOrSource : nodeOrSource.source

  yield put(fetchingParents())

  try {
    const data = yield call([BigQuery, 'fetchParents'], source)
    yield put(fetchParentsSucceeded(data))

    return data
  } catch (e) {
    console.warn(e)
    const errorObj = {
      hasError: true,
      type: 'fetchParentsFailed',
      node: nodeOrSource,
    }
    yield put(fetchParentsFailed(errorObj))
  }
}

function* fetchChildren(nodeOrSource) {
  const source = typeof nodeOrSource === 'string' ? nodeOrSource : nodeOrSource.source

  yield put(fetchingChildren())

  try {
    const data = yield call([BigQuery, 'fetchChildren'], source)
    yield put(fetchChildrenSucceeded(data))

    return data
  } catch (e) {
    console.error(e)
    const errorObj = {
      hasError: true,
      type: 'fetchChildrenFailed',
      node: nodeOrSource
    }
    yield put(fetchChildrenFailed(errorObj))
  }
}

function* extendTrunk(node) {
  let trunk = [node]

  const nextParentData = yield call(fetchParents, node.target)
  
  if (nextParentData?.meta?.count) {
    const nextBranch = yield call(extendTrunk, nextParentData.data[0])
    trunk = trunk.concat(nextBranch)
  } else {
    trunk.push({
      source: node.target,
      relation: 'rel:root',
      target: null,
    })
  }

  yield put(updateTrunk(trunk))

  return trunk
}

function* extendBranch(node, ignore) {
  let branch = []
  const childrenData = yield call(fetchChildren, node.source)

  if (childrenData?.meta?.count) {
    for (const datum of childrenData.data) {
      if (!ignore.find((compNode) => {
        return (
          compNode.source === datum.source &&
          compNode.target === datum.target
          ) || (
          compNode.target === datum.source &&
          compNode.source === datum.target
        )
      })) {
        yield put(addToBranches(datum))
  
        branch = branch.concat([datum])
        const newBranch = yield call(extendBranch, datum, ignore)
        branch = branch.concat(newBranch)
      }
    }
  }

  return branch
}

function* buildTree(action) {
  if (!action.payload) return false

  yield put(startLoading())
  yield put(resetTree())
  yield put(clearError())

  yield delay(500)

  yield put(setSeed(action.payload))

  const seedNodeData = yield call(fetchParents, action.payload)
  if (seedNodeData.meta.count) {
    const seedNode = seedNodeData.data[0]
    const fetchedTreeRes = yield call(fetchTree, seedNode.source)

    if (fetchedTreeRes.meta.count) {
      const fetchedTree = JSON.parse(fetchedTreeRes.data[0].body)
  
      yield put(updateTrunk(fetchedTree.trunk))
      yield put(updateBranches(fetchedTree.branches))
      yield put(trunkGenerated(fetchedTree.trunk))
      yield put(branchesGenerated(fetchedTree.branches))
    } else { 
      const trunk = yield call(extendTrunk, seedNode)
      yield put(updateTrunk(trunk))
      yield put(trunkGenerated(trunk))
    
      let branches = []
    
      for (const node of trunk) {
        const newBranch = yield call(extendBranch, node, trunk)
        branches = branches.concat(newBranch)
      }

      yield put(branchesGenerated(branches))
  
      // yield call(saveTree, action.payload, trunk, branches)
    } 
  } else {
    const errorObj = {
      hasError: true,
      type: 'notFound',
      node: {
        source: action.payload,
      }
    }
    yield put(seedFailed(errorObj))
  }

  yield put(finishLoading())
}

function* handleError(action) {
  const errorObj = action.payload

  switch (errorObj.type) {
    case 'ambiguous':
      yield put(removeFromBranches(errorObj.node))
      break;
    case 'notFound':
      yield put(setError('Could not find this word in the etymology database!'))
      break
    case 'fetchChildrenFailed':
      yield put(setError(`Could not fetch related words for: ${JSON.stringify(errorObj.node)}.`))
      break;
    default:
      yield put(setError('An unknown error occurred!'))
  }
}

function* watchPlantSeed() {
  const task = yield takeLatest(plantSeed, buildTree)
  yield take(cancelSeed)
  yield cancel(task)
}

function* watchHandleError() {
  yield takeLatest([
    ingestionFailed,
    fetchTreeFailed,
    saveTreeFailed,
    fetchParentsFailed,
    fetchChildrenFailed,
    seedFailed,
  ], handleError)
}

function* rootSaga() {
  yield all([
    watchPlantSeed(),
    watchHandleError(),
  ])
}

export default rootSaga
