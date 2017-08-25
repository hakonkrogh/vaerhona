import React from 'react';
import Head from 'next/head';

import css from './styles';

export default ({ children }) => (
    <div>
        <Head>
            <style dangerouslySetInnerHTML={{ __html: css }}></style>
        </Head>
        {children}
    </div>
);
