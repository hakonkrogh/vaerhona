import React from 'react';
import moment from 'moment';
import Head from 'next/head';

import css from './styles';

// Set the global locale
moment.locale('no');

export default ({ children }) => (
    <div>
        <Head>
            <style dangerouslySetInnerHTML={{ __html: css }}></style>
        </Head>
        {children}
    </div>
);
