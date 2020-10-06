import { useQuery } from 'urql';

import Layout from 'modules/layout';
import PlaceList from 'modules/place-list';

export default function FrontPage() {
  const [result] = useQuery({
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
    pause: typeof 'window' === 'undefined',
  });

  const { data, fetching, error } = result;

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
