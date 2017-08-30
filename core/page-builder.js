import React from 'react';
import withRedux from 'next-redux-wrapper';

import api from '../isomorphic/api';
import initStore from '../store';
import { setClientInfo, getClientInfo } from '../store/app';

function setClientInfoFromHeaders ({ isServer, req, store }) {
    return new Promise((resolve) => {
        function checkState () {
            const state = store.getState();
            const clientInfo = getClientInfo(state);
            if (typeof clientInfo !== 'undefined') {

                // Send the client info to the api
                api.setClientInfo(clientInfo);

                unsubscribe();
                resolve();
            }
        }

        const unsubscribe = store.subscribe(checkState);
        checkState();

        if (isServer) {
            const accept = req.headers['accept'];
            const webp = accept === '*/*' || accept.indexOf('image/webp') !== -1;
            store.dispatch(setClientInfo({
                webp
            }));
        }
    });
}

export default function pageBuilder ({ category, component, getInitialProps }) {

    // Uppercase name ensures we can pass props
    const Page = component;

    let loadPropsAfterMount = false;
    let getInitialPropsArgs;

    class GenericPage extends React.Component {
      static async getInitialProps (...args) {
        const { isServer } = args;
        let props = {};
        if (args[0].isServer) {
          try {
              await setClientInfoFromHeaders(...args);
              props = await getInitialProps(...args);
          } catch (e) {
              console.error('error', e);
          }
        } else {
          loadPropsAfterMount = true;
          getInitialPropsArgs = args;
        }
        return props;
      }

      constructor (props) {
        super(props);
        this.state = props;
      }

      componentDidMount () {
        if (loadPropsAfterMount) {
          getInitialProps(...getInitialPropsArgs)
            .then(props => this.setState(props));
        }
      }

      render () {
        return <Page {...this.state} />;
      }
    }

    return withRedux(initStore)(GenericPage);
}
