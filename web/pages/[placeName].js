import React from 'react';
import { upperFirst } from 'core/utils';

import { useReloadOnRestore } from 'core/use-reload-on-restore';
import Layout from 'modules/layout';
import { SnapshotsNavigator } from 'modules/snapshots-navigator';
import { getPlaceForPage } from 'services/place-page';

export default function PlacePage({ place }) {
  useReloadOnRestore();

  return (
    <Layout title={upperFirst(place.name)}>
      {/* A newer latest snapshot starts the navigator again from it. */}
      <SnapshotsNavigator
        key={`${place.name}:${place.lastSnapshot?.cuid}`}
        place={place}
      />
    </Layout>
  );
}

// Runs on every request and is not cached, because the page must show the
// latest snapshot (rule F1 in SPEC.md).
export async function getServerSideProps({ params }) {
  const place = await getPlaceForPage(params.placeName);

  return place ? { props: { place } } : { notFound: true };
}
