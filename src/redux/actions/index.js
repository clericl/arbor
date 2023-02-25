import { createAction } from "@reduxjs/toolkit";

export const requestFetchTree = createAction('arbor/requestFetchTree')
export const fetchingTree = createAction('arbor/fetchingTree')
export const fetchTreeSucceeded = createAction('arbor/fetchTreeSucceeded')
export const fetchTreeFailed = createAction('arbor/fetchTreeFailed')

export const requestSaveTree = createAction('arbor/requestSaveTree')
export const savingTree = createAction('arbor/savingTree')
export const saveTreeSucceeded = createAction('arbor/saveTreeSucceeded')
export const saveTreeFailed = createAction('arbor/saveTreeFailed')

export const requestFetchParents = createAction('arbor/requestFetchParents')
export const fetchingParents = createAction('arbor/fetchingParents')
export const fetchParentsSucceeded = createAction('arbor/fetchParentsSucceeded')
export const fetchParentsFailed = createAction('arbor/fetchParentsFailed')

export const requestFetchChildren = createAction('arbor/requestFetchChildren')
export const fetchingChildren = createAction('arbor/fetchingChildren')
export const fetchChildrenSucceeded = createAction('arbor/fetchChildrenSucceeded')
export const fetchChildrenFailed = createAction('arbor/fetchChildrenFailed')

export const plantSeed = createAction('arbor/plantSeed')
export const seedFailed = createAction('arbor/seedFailed')
export const treeGenerated = createAction('arbor/treeGenerated')
