import { createAction } from "@reduxjs/toolkit";

export const requestFetchTree = createAction('REQUEST_FETCH_TREE')
export const fetchingTree = createAction('FETCHING_TREE')
export const fetchTreeSucceeded = createAction('FETCH_TREE_SUCCEEDED')
export const fetchTreeFailed = createAction('FETCH_TREE_FAILED')

export const requestSaveTree = createAction('REQUEST_SAVE_TREE')
export const savingTree = createAction('SAVING_TREE')
export const saveTreeSucceeded = createAction('SAVE_TREE_SUCCEEDED')
export const saveTreeFailed = createAction('SAVE_TREE_FAILED')

export const requestFetchParents = createAction('REQUEST_FETCH_PARENTS')
export const fetchingParents = createAction('FETCHING_PARENTS')
export const fetchParentsSucceeded = createAction('FETCH_PARENTS_SUCCEEDED')
export const fetchParentsFailed = createAction('FETCH_PARENTS_FAILED')

export const requestFetchChildren = createAction('REQUEST_FETCH_CHILDREN')
export const fetchingChildren = createAction('FETCHING_CHILDREN')
export const fetchChildrenSucceeded = createAction('FETCH_CHILDREN_SUCCEEDED')
export const fetchChildrenFailed = createAction('FETCH_CHILDREN_FAILED')

export const plantSeed = createAction('PLANT_SEED')
export const trunkGenerated = createAction('TRUNK_GENERATED')
export const branchesGenerated = createAction('BRANCHES_GENERATED')
export const treeGenerated = createAction('TREE_GENERATED')
