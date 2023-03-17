import BigQuery from '../../utils/BigQuery'
import { all, call, cancel, cancelled, delay, fork, put, select, take, takeLatest } from 'redux-saga/effects'
import { fetchingEtymologies, fetchEtymologiesSucceeded, fetchEtymologiesFailed, fetchingDescendants, fetchDescendantsSucceeded, fetchDescendantsFailed, buildingTrunk, buildTrunkComplete, buildingBranches, buildBranchesComplete, fetchingTree, fetchTreeSucceeded, fetchTreeFailed, savingTree, saveTreeSucceeded, saveTreeFailed, requestTree, cancelTree, treeFailed, ingestionFailed } from '../actions'
import { clearError, finishLoading, setError, startLoading } from '../reducers/ui'
import Wiktionary from '../../utils/Wiktionary'
import { addNode, resetTree, setNodes, setSource } from '../reducers/tree'
import ArborNode from '../../utils/ArborNode'

function* fetchTree(source) {
  yield put(fetchingTree())

  try {
    const data = yield call([BigQuery, 'fetchTree'], source)
    yield put(fetchTreeSucceeded(!!data?.meta?.count))

    return data
  } catch(e) {
    console.warn(e)
    const errorObj = {
      hasError: true,
      type: 'fetchTreeFailed',
      source,
    }
    yield put(fetchTreeFailed(errorObj))
  }
}

function* saveTree(source, nodes) {
  yield put(savingTree())

  try {
    const data = yield call([BigQuery, 'saveTree'], { source, nodes })
    yield put(saveTreeSucceeded())

    return data
  } catch(e) {
    console.warn(e)
    const errorObj = {
      hasError: true,
      type: 'saveTreeFailed',
      source,
    }
    yield put(saveTreeFailed(errorObj))
  }
}

/**
 * Fetch all etymologies for a given node.
 * @param {ArborNode} node 
 * @returns {ArborNode[]}
 */
function* fetchEtymologies(node) {
  yield put(fetchingEtymologies(node.source))
  const { filterHomographs } = yield select((state) => state.tree.options)

  try {
    const etymologies = yield call(
      [Wiktionary, 'getEtymologies'],
      node.sourceWord,
      node.sourceLang.refName,
      filterHomographs
    )

    yield put(fetchEtymologiesSucceeded(etymologies.length))
    return etymologies
  } catch (e) {
    console.warn(e)
    const errorObj = {
      hasError: true,
      type: 'fetchEtymologiesFailed',
      node: node.source,
    }
    yield put(fetchEtymologiesFailed(errorObj))
  }

  return []
}

/**
 * Fetch all direct descendants of a given node.
 * @param {ArborNode} node 
 * @returns {ArborNode[]}
 */
function* fetchDescendants(node) {
  yield put(fetchingDescendants(node.source))
  const { descendantsLimit } = yield select((state) => state.tree.options)

  try {
    const res = yield call(
      [BigQuery, 'fetchDescendants'],
      `${node.sourceLang.alpha3}: ${node.sourceWord}`,
      descendantsLimit
    )

    const descendants = res.data.map((datum) => new ArborNode(datum))

    yield put(fetchDescendantsSucceeded(descendants.length))
    return descendants
  } catch (e) {
    console.warn(e)
    const errorObj = {
      hasError: true,
      type: 'fetchDescendantsFailed',
      node: node.source,
    }
    yield put(fetchDescendantsFailed(errorObj))
  }

  return []
}


/**
 * Recursively fetch the etymological ancestors and associated links for a
 * given node.
 * @param {ArborNode} node 
 * @returns {{ancestors: ArborNode[], links: ArborLink[]}}
 */
function* extendTrunk(node) {
  if (node.source.match(/#/g)) return []

  const nodesInState = yield select((state) => state.tree.nodes)
  const [ancestors] = yield all([
    call(fetchEtymologies, node),
    delay(500),
  ])
 
  const concatenated = [...ancestors]

  for (const ancestor of ancestors) {
    if (
      (node.source === ancestor.target &&
        node.target === ancestor.source) ||
      nodesInState.find((node) => ArborNode.areEqual(node, ancestor))
    ) continue;

    if (nodesInState.find((node) => node.source === ancestor.source)) {
      ancestor.source += '#'
    }

    const serializedNode = ancestor.serialize()
    yield put(addNode(serializedNode))

    const newAncestors = yield call(extendTrunk, ancestor)
    concatenated.push(...newAncestors)
  }

  return concatenated
}

function* extendBranches(node, recurse = false) {
  const nodesInState = yield select((state) => state.tree.nodes)
  const [descendants] = yield all([
    call(fetchDescendants, node),
    delay(500),
  ])
 
  const concatenated = [...descendants]

  for (const descendant of descendants) {
    if (
      descendant.equals(node) ||
      nodesInState.find((node) => ArborNode.areEqual(node, descendant))
    ) continue;

    if (nodesInState.find((node) => node.source === descendant.source)) {
      descendant.source += '#'
    }

    const serializedNode = descendant.serialize()
    yield put(addNode(serializedNode))

    if (recurse) {
      const nextDescendants = yield call(extendBranches, descendant)
      concatenated.push(...nextDescendants)
    }
  }

  return concatenated
}

/**
 * Find all nodes and links for a seed source.
 * @param {Action} action
 */
function* buildTree(action) {
  if (!action.payload) return false

  yield put(startLoading())
  yield put(resetTree())
  yield put(clearError())

  try {
    yield delay(500)
  
    yield put(setSource(action.payload))
  
    const fetchedTreeRes = yield call(fetchTree, action.payload)
    if (fetchedTreeRes.meta.count) {
      const fetchedTree = fetchedTreeRes.data[0]
  
      const parsedNodes = JSON.parse(fetchedTree.nodes)
      yield put(setNodes(parsedNodes))
  
      yield put(buildTrunkComplete())
      yield put(buildBranchesComplete())
    } else {
      yield put(buildingTrunk())
    
      const seedNode = new ArborNode(action.payload, null, 'rel:seed')
      const ancestors = yield call(extendTrunk, seedNode)
    
      yield put(buildTrunkComplete())
  
      if (ancestors.length) {
        yield put(buildingBranches())
        for (const ancestor of ancestors) {
          yield call(extendBranches, ancestor)
        }
      
        yield put(buildBranchesComplete())
      }
    
      const { nodes } = yield select((state) => state.tree)
  
      // yield call(saveTree, action.payload, nodes)
    }
  } catch (e) {
    console.warn(e)
    const errorObj = {
      hasError: true,
      type: 'treeFailed',
      source: action.payload,
    }
    yield put(treeFailed(errorObj))
  } finally {
    yield put(finishLoading())

    if (yield cancelled()) {
      const errorObj = {
        hasError: true,
        type: 'treeCanceled',
        source: action.payload,
      }
      yield put(treeFailed(errorObj))
    }
  }
}

function* handleError(action) {
  const errorObj = action.payload

  switch (errorObj.type) {
    case 'notFound':
      yield put(setError('Could not find this word in the etymology database!'))
      break
    case 'fetchChildrenFailed':
      yield put(setError(`Could not fetch related words for: ${errorObj.source}.`))
      break;
    case 'treeCanceled':
      yield put(setError(`Canceled!`))
      break;
    default:
      yield put(setError('An unknown error occurred!'))
  }
}

function* watchRequestTree() {
  let lastTask = null

  while (true) {
    const action = yield take([
      cancelTree,
      requestTree,
    ])

    if (action.type === requestTree.type) {
      if (lastTask) {
        yield cancel(lastTask)
      }
  
      lastTask = yield fork(buildTree, action)
    } else if (action.type === cancelTree.type) {
      if (lastTask) {
        yield cancel(lastTask)
        lastTask = null
      }
    }
  }
}

function* watchHandleError() {
  yield takeLatest([
    ingestionFailed,
    fetchTreeFailed,
    saveTreeFailed,
    fetchEtymologiesFailed,
    fetchDescendantsFailed,
    treeFailed,
  ], handleError)
}

function* rootSaga() {
  yield all([
    watchRequestTree(),
    watchHandleError(),
  ])
}

export default rootSaga
