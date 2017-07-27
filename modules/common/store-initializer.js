import withRedux from 'next-redux-wrapper';
import initStore from '../../store';

export default (component) => withRedux(initStore)(component);
