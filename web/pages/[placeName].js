import React, { useEffect } from 'react';
import upperFirst from 'upper-case-first';

import Layout from 'modules/layout';
import { SnapshotsNavigator } from 'modules/snapshots-navigator';
import { getPlaceForPage } from 'services/place-page';

export default function PlacePage({ place }) {
  // The back button can restore a saved copy of the page, which could show an
  // older snapshot than the latest.
  useEffect(() => {
    function onPageShow(event) {
      if (event.persisted) {
        window.location.reload();
      }
    }

    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  return (
    <Layout title={upperFirst(place.name)}>
      <SnapshotsNavigator key={place.name} place={place} />
    </Layout>
  );
}

// Runs on every request and is not cached, because the page must show the
// latest snapshot (rule F1 in SPEC.md).
export async function getServerSideProps({ params }) {
  const place = await getPlaceForPage(params.placeName);

  return place ? { props: { place } } : { notFound: true };
}
