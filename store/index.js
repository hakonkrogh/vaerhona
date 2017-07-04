import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'

import AppReducer, { initialState } from './app/reducer';

export default function initStore (_initialState = initialState) {

  const enhancers = [
    applyMiddleware(thunkMiddleware)
  ];

  if (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(window.__REDUX_DEVTOOLS_EXTENSION__());
  }

  return createStore(AppReducer, _initialState, compose(...enhancers));
}
