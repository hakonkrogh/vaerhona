import test from 'ava';
import { reducerTest } from 'redux-ava';
import appReducer, { getShowAddSnapshot } from '../AppReducer';
import { toggleAddSnapshot } from '../AppActions';

test('action for TOGGLE_ADD_SNAPSHOT is working', reducerTest(
  appReducer,
  { showAddSnapshot: false },
  toggleAddSnapshot(),
  { showAddSnapshot: true },
));

test('getShowAddSnapshot selector', t => {
  t.is(getShowAddSnapshot({
    app: { showAddSnapshot: false },
  }), false);
});
