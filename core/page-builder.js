import React from 'react';
import withRedux from 'next-redux-wrapper';

import api from '../isomorphic/api';
import initStore from '../store';
import { setClientInfo, getClientInfo } from '../store/app';

function setClientInfoFromHeaders ({ isServer, req, store }) {
    return new Promise((resolve) => {
        const unsubscriber = store.subscribe(() => {
            const state = store.getState();
            const clientInfo = getClientInfo(state);
            if (typeof clientInfo !== 'undefined') {

                // Update the api
                api.setClientInfo(clientInfo);

                unsubscriber();
                resolve();
            }
        });
        if (isServer) {
            const accept = req.headers['accept'];
            const webp = accept === '*/*' || accept.indexOf('image/webp') !== -1;
            store.dispatch(setClientInfo({
                webp
            }));
        }
    });
}

export default function pageBuilder ({ component, getInitialProps }) {
    component.getInitialProps = async (...args) => {
        let props = {};

        try {
            await setClientInfoFromHeaders(...args);
            props = await getInitialProps(...args);
        } catch (e) {
            console.error('error', e);
        }
        return props;
    }

    return withRedux(initStore)(component);
}
