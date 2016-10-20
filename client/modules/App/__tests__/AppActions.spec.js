import test from 'ava';
import { actionTest } from 'redux-ava';
import { TOGGLE_ADD_SNAPSHOT, toggleAddSnapshot } from '../AppActions';

test('should return the correct type for toggleAddSnapshot', actionTest(toggleAddSnapshot, null, { type: TOGGLE_ADD_SNAPSHOT }));
