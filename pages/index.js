import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

import withApolloClient from '../apollo/with-apollo-client';

import Layout from '../modules/layout';
import PlaceList from '../modules/place-list';

const QUERY_HOME = gql`
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
`;

const FrontPage = () => {
  const { data, loading, error } = useQuery(QUERY_HOME);

  if (loading) {
    return <Layout loading={loading} title="Værhøna" />;
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
};

export default withApolloClient(FrontPage);
