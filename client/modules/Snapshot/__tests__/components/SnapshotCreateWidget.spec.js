import React from 'react';
import test from 'ava';
import sinon from 'sinon';
import { FormattedMessage } from 'react-intl';
import { SnapshotCreateWidget } from '../../components/SnapshotCreateWidget/SnapshotCreateWidget';
import { mountWithIntl, shallowWithIntl } from '../../../../util/react-intl-test-helper';

const props = {
  addSnapshot: () => {},
  showAddSnapshot: true,
};
/*
test('renders properly', t => {
  const wrapper = shallowWithIntl(
    <SnapshotCreateWidget {...props} />
  );

  t.truthy(wrapper.hasClass('form'));
  t.truthy(wrapper.hasClass('appear'));
  t.truthy(wrapper.find('h2').first().containsMatchingElement(<FormattedMessage id="createNewSnapshot" />));
  t.is(wrapper.find('input').length, 2);
  t.is(wrapper.find('textarea').length, 1);
});

test('hide when showAddSnapshot is false', t => {
  const wrapper = mountWithIntl(
    <SnapshotCreateWidget {...props} />
  );

  wrapper.setProps({ showAddSnapshot: false });
  t.falsy(wrapper.hasClass('appear'));
});

test('has correct props', t => {
  const wrapper = mountWithIntl(
    <SnapshotCreateWidget {...props} />
  );

  t.is(wrapper.prop('addSnapshot'), props.addSnapshot);
  t.is(wrapper.prop('showAddSnapshot'), props.showAddSnapshot);
});

test('calls addSnapshot', t => {
  const addSnapshot = sinon.spy();
  const wrapper = mountWithIntl(
    <SnapshotCreateWidget addSnapshot={addSnapshot} showAddSnapshot />
  );

  wrapper.ref('name').get(0).value = 'David';
  wrapper.ref('title').get(0).value = 'Some Title';
  wrapper.ref('content').get(0).value = 'Bla Bla Bla';

  wrapper.find('a').first().simulate('click');
  t.truthy(addSnapshot.calledOnce);
  t.truthy(addSnapshot.calledWith('David', 'Some Title', 'Bla Bla Bla'));
});

test('empty form doesn\'t call addSnapshot', t => {
  const addSnapshot = sinon.spy();
  const wrapper = mountWithIntl(
    <SnapshotCreateWidget addSnapshot={addSnapshot} showAddSnapshot />
  );

  wrapper.find('a').first().simulate('click');
  t.falsy(addSnapshot.called);
});*/
