import BigQuery from '../../utils/BigQuery'
import { all, call, cancel, delay, put, select, take, takeLatest } from 'redux-saga/effects'
import { fetchingEtymologies, fetchEtymologiesSucceeded, fetchEtymologiesFailed, fetchingDescendants, fetchDescendantsSucceeded, fetchDescendantsFailed, buildingTrunk, buildTrunkComplete, buildingBranches, buildBranchesComplete, fetchingNetwork, fetchNetworkSucceeded, fetchNetworkFailed, savingNetwork, saveNetworkSucceeded, saveNetworkFailed, requestNetwork } from '../actions'
import { clearError, finishLoading, setError, startLoading } from '../reducers/ui'
import Wiktionary from '../../utils/Wiktionary'
import { addLink, addNode, resetNetwork, setLinks, setNodes, setSource } from '../reducers/network'
import ArborLink from '../../utils/ArborLink'
import ArborNode from '../../utils/ArborNode'

function* fetchNetwork(source) {
  yield put(fetchingNetwork())

  try {
    const data = yield call([BigQuery, 'fetchNetwork'], source)
    yield put(fetchNetworkSucceeded(!!data?.meta?.count))

    return data
  } catch(e) {
    console.warn(e)
    const errorObj = {
      hasError: true,
      type: 'fetchNetworkFailed',
      source,
    }
    yield put(fetchNetworkFailed(errorObj))
  }
}

function* saveNetwork(source, nodes, links) {
  yield put(savingNetwork())

  const parsedNodes = nodes.map((node) => JSON.parse(node))
  const parsedLinks = links.map((link) => JSON.parse(link))

  try {
    const data = yield call([BigQuery, 'saveNetwork'], { source, nodes: parsedNodes, links: parsedLinks })
    yield put(saveNetworkSucceeded())

    return data
  } catch(e) {
    console.warn(e)
    const errorObj = {
      hasError: true,
      type: 'saveNetworkFailed',
      source,
    }
    yield put(saveNetworkFailed(errorObj))
  }
}

/**
 * Fetch all etymologies for a given node.
 * @param {ArborNode} node 
 * @returns {ArborNode[]}
 */
function* fetchEtymologies(node) {
  yield put(fetchingEtymologies())
  const { filterHomographs } = yield select((state) => state.words.options)

  try {
    const etymologies = yield call(
      [Wiktionary, 'getEtymologies'],
      node.word,
      node.langRefName,
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
  yield put(fetchingDescendants())

  try {
    const res = yield call(
      [BigQuery, 'fetchDescendants'],
      `${node.lang3}: ${node.word}`
    )

    const descendants = res.data.map((datum) => new ArborNode(datum.source))

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
  const nodesInState = yield select((state) => state.network.nodes)
  const ancestors = yield call(fetchEtymologies, node)
 
  const concatenated = [...ancestors]
  const links = []

  for (const ancestor of ancestors) {
    const nodeString = ancestor.toString()
    if (
      ancestor.equals(node) ||
      nodesInState.find((node) => node === nodeString)
    ) continue;

    const newLink = new ArborLink(node, ancestor)

    yield put(addNode(nodeString))
    yield put(addLink(newLink.toString()))

    links.push(newLink)

    const newAncestors = yield call(extendTrunk, ancestor)
    concatenated.push(...newAncestors.ancestors)
    links.push(...newAncestors.links)
  }

  return {
    ancestors: concatenated,
    links,
  }
}

function* extendBranches(node) {
  const nodesInState = yield select((state) => state.network.nodes)
  const descendants = yield call(fetchDescendants, node)
 
  const concatenated = [...descendants]
  const links = []

  for (const descendant of descendants) {
    const nodeString = descendant.toString()
    if (
      descendant.equals(node) ||
      nodesInState.find((node) => node === nodeString)
    ) continue;

    const newLink = new ArborLink(descendant, node)

    yield put(addNode(nodeString))
    yield put(addLink(newLink.toString()))

    links.push(newLink)

    const nextDescendants = yield call(extendBranches, descendant)
    concatenated.push(...nextDescendants.descendants)
    links.push(...nextDescendants.links)
  }

  return {
    descendants: concatenated,
    links,
  }
}

/**
 * Find all nodes and links for a seed source.
 * @param {Action} action
 */
function* buildNetwork(action) {
  if (!action.payload) return false

  yield put(startLoading())
  yield put(resetNetwork())
  yield put(clearError())

  yield delay(500)

  yield put(setSource(action.payload))

  const fetchedNetworkRes = yield call(fetchNetwork, action.payload)
  if (fetchedNetworkRes.meta.count) {
    const fetchedNetwork = fetchedNetworkRes.data[0]

    const stringNodes = JSON.parse(fetchedNetwork.links).map((node) => JSON.stringify(node))
    const stringLinks = JSON.parse(fetchedNetwork.nodes).map((link) => JSON.stringify(link))

    yield put(setLinks(stringNodes))
    yield put(setNodes(stringLinks))

    yield put(buildTrunkComplete())
    yield put(buildBranchesComplete())
  } else {
    yield put(buildingTrunk())
  
    const seedNode = new ArborNode(action.payload)
    const { ancestors } = yield call(extendTrunk, seedNode)
  
    yield put(buildTrunkComplete())

    if (ancestors.length) {
      yield put(buildingBranches())
      for (const ancestor of ancestors) {
        yield call(extendBranches, ancestor)
      }
    
      yield put(buildBranchesComplete())
    }
  
    const { nodes, links } = yield select((state) => state.network)
    const nodesToSave = nodes.map((node) => node.toString())
    const linksToSave = links.map((link) => link.toString())

    yield call(saveNetwork, action.payload, nodesToSave, linksToSave)
  }

  yield put(finishLoading())
}

function* watchRequestNetwork() {
  yield takeLatest(requestNetwork, buildNetwork)
}

function* rootSaga() {
  yield all([
    watchRequestNetwork(),
  ])
}

export default rootSaga
