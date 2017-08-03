import withRedux from 'next-redux-wrapper';
import initStore from '../../store';

export default (component, ...rest) => withRedux(initStore, ...rest)(component);
