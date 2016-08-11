import React from 'react';
import test from 'ava';
import sinon from 'sinon';
import SnapshotListItem from '../../components/SnapshotListItem/SnapshotListItem';
import { mountWithIntl, shallowWithIntl } from '../../../../util/react-intl-test-helper';

const snapshot = { cuid: 'f34gb2bh24b24b2', placeCuid: 'a34gb2bh24b24b2', temperature: 1, pressure: 2, humidity: 3 };
const props = {
  snapshot,
  onDelete: () => {},
};

test('renders properly', t => {
  const wrapper = shallowWithIntl(
    <SnapshotListItem {...props} />
  );

  t.truthy(wrapper.hasClass('single-post'));
  t.is(wrapper.find('Link').first().prop('children'), snapshot.title);
  t.regex(wrapper.find('.author-name').first().text(), new RegExp(snapshot.name));
  t.is(wrapper.find('.post-desc').first().text(), snapshot.content);
});

test('has correct props', t => {
  const wrapper = mountWithIntl(
    <SnapshotListItem {...props} />
  );

  t.deepEqual(wrapper.prop('post'), props.snapshot);
  t.is(wrapper.prop('onClick'), props.onClick);
  t.is(wrapper.prop('onDelete'), props.onDelete);
});

test('calls onDelete', t => {
  const onDelete = sinon.spy();
  const wrapper = shallowWithIntl(
    <SnapshotListItem post={snapshot} onDelete={onDelete} />
  );

  wrapper.find('.post-action > a').first().simulate('click');
  t.truthy(onDelete.calledOnce);
});
