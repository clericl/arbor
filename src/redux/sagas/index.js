import BigQuery from '../../utils/BigQuery'
import { all, call, put, takeLatest } from 'redux-saga/effects'
import { branchesGenerated, fetchChildrenFailed, fetchChildrenSucceeded, fetchingChildren, fetchingParents, fetchingTree, fetchParentsFailed, fetchParentsSucceeded, fetchTreeFailed, fetchTreeSucceeded, plantSeed, saveTreeFailed, saveTreeSucceeded, savingTree, trunkGenerated } from '../actions'
import { growBranches, growTrunk } from '../reducers/words'

function* fetchTree(seed) {
  yield put(fetchingTree())

  try {
    const data = yield call([BigQuery, 'fetchTree'], seed)
    yield put(fetchTreeSucceeded())

    return data
  } catch(e) {
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
    yield put(fetchParentsFailed(e))
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
    yield put(fetchChildrenFailed(e))
  }
}

function* extendTrunk(node) {
  let trunk = [node]
  let canExtend = true

  while (canExtend) {
    const nextParentData = yield call(fetchParents, trunk[trunk.length - 1].source)

    if (nextParentData?.meta?.count) {
      if (nextParentData.meta.count > 1) {
        for (const datum of nextParentData.data) {
          const newNode = {
            source: datum.target,
            relation: 'rel:etymological_origin_of',
            target: datum.source,
          }
          const newBranch = yield call(extendTrunk, newNode)
          trunk = trunk.concat(newBranch)

          yield put(growTrunk(trunk))
        }
      } else {
        trunk = trunk.concat([{
          source: nextParentData.data[0].target,
          relation: 'rel:etymological_origin_of',
          target: nextParentData.data[0].source,
        }])

        yield put(growTrunk(trunk))
      }
    } else {
      canExtend = false
    }
  }

  return trunk
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
        branch = branch.concat([datum])
        const newBranch = yield call(extendBranch, datum, ignore)
        branch = branch.concat(newBranch)

        yield put(growBranches(branch))
      }
    }
  }

  return branch
}

function* buildTree(action) {
  if (!action.payload) return false

  const fetchedTreeRes = yield call(fetchTree, action.payload)
  if (fetchedTreeRes.meta.count) {
    const fetchedTree = JSON.parse(fetchedTreeRes.data[0].body)

    yield put(growTrunk(fetchedTree.trunk))
    yield put(growBranches(fetchedTree.branches))
    yield put(trunkGenerated(fetchedTree.trunk))
    yield put(branchesGenerated(fetchedTree.branches))
  } else {
    const baseNode = {
      source: action.payload,
      relation: 'rel:seed',
      target: null,
    }
  
    const trunk = yield call(extendTrunk, baseNode)
    yield put(growTrunk(trunk))
    yield put(trunkGenerated(trunk))
  
    let branches = []
  
    for (const node of trunk) {
      const newBranch = yield call(extendBranch, node, trunk)
      branches = branches.concat(newBranch)
    }
    
    yield put(growBranches(branches))
    yield put(branchesGenerated(branches))

    yield call(saveTree, action.payload, trunk, branches)
  }
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
