import React from 'react';
import upperFirst from 'upper-case-first';
import { useQuery } from 'urql';

import Layout from 'modules/layout';
import { SnapshotsNavigator } from 'modules/snapshots-navigator';
import { PLACE } from 'modules/queries';

const isServer = typeof 'window' === 'undefined';

export default function PlacePage({ placeName }) {
  const [{ data: { place } = {}, fetching } = {}] = useQuery({
    query: PLACE,
    variables: { placeName },
    pause: isServer,
  });

  const loading = isServer || fetching;

  return (
    <Layout title={upperFirst(placeName)} loading={loading}>
      {!loading && <SnapshotsNavigator place={place} />}
    </Layout>
  );
}

export function getStaticPaths() {
  return {
    paths: ['/veggli', '/buvassbrenna', '/myking'],
    fallback: false,
  };
}

export function getStaticProps({ params }) {
  return {
    props: {
      placeName: params.placeName,
    },
    revalidate: 60,
  };
}
