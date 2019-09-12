import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import Layout from '../modules/layout';
import PlaceList from '../modules/place-list';

const QUERY_HOME = gql`
  {
    places {
      name
      cuid
      mostRecentSnapshot {
        cuid
        date
        temperature
        image
        placeName
      }
    }
  }
`;

function byMostRecentSnapshot(a, b) {
  return (
    new Date(b.mostRecentSnapshot.date) - new Date(a.mostRecentSnapshot.date)
  );
}

export default class FrontPage extends React.Component {
  render() {
    return (
      <Query query={QUERY_HOME} variables={{}}>
        {({ data, loading, error }) => {
          if (loading) {
            return <Layout loading={loading} title="Værhøna" />;
          }

          if (error || !data.places) {
            return 'Oh no.';
          }

          const places = data.places.sort(byMostRecentSnapshot);

          return (
            <Layout title="Værhøna">
              <PlaceList places={places} />
            </Layout>
          );
        }}
      </Query>
    );
  }
}
