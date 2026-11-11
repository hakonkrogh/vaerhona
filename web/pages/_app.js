import { ViewTransition } from 'react';
import Head from 'next/head';

import 'ui/global.css';
import { montserrat } from 'ui/font';
import navigationBar from 'modules/layout/navigation-bar.module.css';
import { useNavigationPending } from 'core/use-navigation-pending';

export default function App({ Component, pageProps }) {
  const navigating = useNavigationPending();

  return (
    <>
      <Head>
        {/* As a home screen app, iOS draws the page under the status bar and
            the home indicator. viewport-fit=cover makes that explicit, and
            the safe-area-inset values then say how much room to leave. */}
        <meta
          name="viewport"
          content="width=device-width, viewport-fit=cover"
        />
      </Head>
      {navigating && (
        <div
          className={navigationBar.bar}
          role="progressbar"
          aria-label="Laster"
        />
      )}
      {/* The class sets the font for the whole page. */}
      <div className={montserrat.className}>
        {/* Next.js draws a new page inside a React transition, so React runs
            the change as a view transition: the pages fade over each other,
            and a photo with the same name on both pages moves. */}
        <ViewTransition>
          <Component {...pageProps} />
        </ViewTransition>
      </div>
    </>
  );
}
