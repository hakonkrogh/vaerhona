import React from 'react';
import test from 'ava';
import { shallow } from 'enzyme';
import SnapshotList from '../../components/SnapshotList';

const snapshots = [
  { cuid: 'f34gb2bh24b24b2', placeCuid: 'a34gb2bh24b24b2', temperature: 1, pressure: 2, humidity: 3 },
  { cuid: 'f34gb2bh24b24b3', placeCuid: 'a34gb2bh24b24b2', temperature: 1, pressure: 2, humidity: 3 },
];

test('renders the list', t => {
  const wrapper = shallow(
    <SnapshotList snapshots={snapshots} handleShowSnapshot={() => {}} handleDeleteSnapshot={() => {}} />
  );

  t.is(wrapper.find('SnapshotListItem').length, 2);
});
