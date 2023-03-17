import { createAction } from "@reduxjs/toolkit";

export const requestFetchTree = createAction('arbor/requestFetchTree')
export const fetchingTree = createAction('arbor/fetchingTree')
export const fetchTreeSucceeded = createAction('arbor/fetchTreeSucceeded')
export const fetchTreeFailed = createAction('arbor/fetchTreeFailed')

export const requestSaveTree = createAction('arbor/requestSaveTree')
export const savingTree = createAction('arbor/savingTree')
export const saveTreeSucceeded = createAction('arbor/saveTreeSucceeded')
export const saveTreeFailed = createAction('arbor/saveTreeFailed')

export const requestFetchEtymologies = createAction('arbor/requestFetchEtymologies')
export const fetchingEtymologies = createAction('arbor/fetchingEtymologies')
export const fetchEtymologiesSucceeded = createAction('arbor/fetchEtymologiesSucceeded')
export const fetchEtymologiesFailed = createAction('arbor/fetchEtymologiesFailed')

export const requestFetchDescendants = createAction('arbor/requestFetchDescendants')
export const fetchingDescendants = createAction('arbor/fetchingDescendants')
export const fetchDescendantsSucceeded = createAction('arbor/fetchDescendantsSucceeded')
export const fetchDescendantsFailed = createAction('arbor/fetchDescendantsFailed')

export const buildingTrunk = createAction('arbor/buildingTrunk')
export const buildTrunkComplete = createAction('arbor/buildTrunkComplete')

export const buildingBranches = createAction('arbor/buildingBranches')
export const buildBranchesComplete = createAction('arbor/buildBranchesComplete')

export const requestTree = createAction('arbor/requestTree')
export const treeFailed = createAction('arbor/treeFailed')
export const treeGenerated = createAction('arbor/treeGenerated')

export const ingestionFailed = createAction('arbor/ingestionFailed')
export const cancelTree = createAction('arbor/cancelTree')
