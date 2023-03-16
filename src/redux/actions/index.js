import { createAction } from "@reduxjs/toolkit";

export const requestFetchNetwork = createAction('arbor/requestFetchNetwork')
export const fetchingNetwork = createAction('arbor/fetchingNetwork')
export const fetchNetworkSucceeded = createAction('arbor/fetchNetworkSucceeded')
export const fetchNetworkFailed = createAction('arbor/fetchNetworkFailed')

export const requestSaveNetwork = createAction('arbor/requestSaveNetwork')
export const savingNetwork = createAction('arbor/savingNetwork')
export const saveNetworkSucceeded = createAction('arbor/saveNetworkSucceeded')
export const saveNetworkFailed = createAction('arbor/saveNetworkFailed')

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

export const requestNetwork = createAction('arbor/requestNetwork')
export const networkFailed = createAction('arbor/networkFailed')
export const networkGenerated = createAction('arbor/networkGenerated')

export const ingestionFailed = createAction('arbor/ingestionFailed')
export const cancelNetwork = createAction('arbor/cancelNetwork')
