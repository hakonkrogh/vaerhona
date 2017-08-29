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

    class GenericPage extends React.Component {
      static async getInitialProps (...args) {
        let props;
        try {
            await setClientInfoFromHeaders(...args);
            props = await getInitialProps(...args);
        } catch (e) {
            console.error('error', e);
        }
        return props;
      }

      render () {
        return <Page {...this.props} />;
      }
    }

    return withRedux(initStore)(GenericPage);
}
