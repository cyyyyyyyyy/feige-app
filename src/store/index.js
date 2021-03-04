import { createStore, applyMiddleware } from 'redux';
import promiseMiddleware from 'redux-promise';
import { combineReducers } from 'redux-immutable';

import convs from './reducers/convs';

const rootReducer = combineReducers({
  convs
});
const middleware = [promiseMiddleware];
const store = createStore(rootReducer, applyMiddleware(...middleware));

export default store;
