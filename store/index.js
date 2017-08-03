import { createStore, applyMiddleware, compose, combineReducers } from 'redux'
import thunkMiddleware from 'redux-thunk'

import app from './app';
import place from './place';
import snapshots from './snapshots';

export default function initStore (_initialState = {}) {

  const enhancers = [
    applyMiddleware(thunkMiddleware)
  ];

  if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(window.__REDUX_DEVTOOLS_EXTENSION__());
  }

  return createStore(combineReducers({
    app,
    place,
    snapshots
  }), _initialState, compose(...enhancers));
}
