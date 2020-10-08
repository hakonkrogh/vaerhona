import { isServer, useRefreshQuery } from 'core/utils';

import Layout from 'modules/layout';
import PlaceList from 'modules/place-list';

export default function FrontPage() {
  const [{ data, fetching, error }] = useRefreshQuery({
    query: `
    {
      places {
        name
        cuid
        lastSnapshot {
          cuid
          date
          temperature
          image
          placeName
        }
      }
    }
  `,
    pause: isServer,
  });

  if (!data || fetching) {
    return <Layout loading title="Værhøna" />;
  }

  if (error) {
    return 'Oh no.';
  }

  if (!data.places) {
    return 'no places';
  }

  return (
    <Layout title="Værhøna" scroll>
      <PlaceList places={data.places} />
    </Layout>
  );
}
