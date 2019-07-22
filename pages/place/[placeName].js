import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import upperFirst from 'upper-case-first';

import { graphDate } from 'core/date';
import Layout from '../../modules/layout';
import { SnapshotsNavigator } from '../../modules/snapshot';

function bySnapshotDate(a, b) {
  return new Date(a.date) - new Date(b.date);
}

function onlyUniqueSnapshots(value, index, self) {
  return self.findIndex(v => v.cuid === value.cuid) === index;
}

const QUERY_PLACE = gql`
  query PLACE(
    $placeName: String!
    $from: String
    $to: String
    $compareTo: String
    $limit: Int
  ) {
    place(name: $placeName) {
      name
    }

    currentSnapshots: snapshots(
      place: $placeName
      from: $from
      to: $to
      limit: $limit
    ) {
      ...snap
    }

    compareSnapshots: snapshots(
      place: $placeName
      from: $from
      to: $compareTo
      limit: $limit
    ) {
      ...snap
    }
  }

  fragment snap on Snapshot {
    cuid
    date
    temperature
    humidity
    pressure
    image
    placeName
  }
`;

export default class PlacePage extends React.Component {
  static getInitialProps({ query }) {
    return { query };
  }

  render() {
    const { query } = this.props;

    const now = new Date();
    now.setDate(now.getDate() + 1);

    const to = graphDate(now);

    now.setFullYear(now.getFullYear() - 1);
    const compareTo = graphDate(now);

    return (
      <Query
        query={QUERY_PLACE}
        variables={{
          placeName: query.placeName,
          limit: 24,
          to,
          compareTo
        }}
      >
        {({ loading, error, data, variables, fetchMore }) => {
          if (loading) {
            return <Layout loading title="Værhøna" />;
          }

          if (error) {
            return <Layout>Oisann</Layout>;
          }

          const loadMoreSnapshots = ({ from, to, limit }) => {
            let compareTo;
            if (to) {
              compareTo = new Date(to);
              compareTo.setFullYear(compareTo.getFullYear() - 1);
            }
            let compareFrom;
            if (from) {
              compareFrom = new Date(from);
              compareFrom.setFullYear(compareFrom.getFullYear() - 1);
            }

            return fetchMore({
              variables: {
                ...variables,
                from: graphDate(from),
                to: graphDate(to),
                compareFrom: graphDate(compareFrom),
                compareTo: graphDate(compareTo),
                limit
              },
              updateQuery: (previousResult, { fetchMoreResult }) => {
                function handleSnaps(name) {
                  return [...previousResult[name], ...fetchMoreResult[name]]
                    .filter(onlyUniqueSnapshots)
                    .sort(bySnapshotDate);
                }

                return Object.assign({}, previousResult, {
                  currentSnapshots: handleSnaps('currentSnapshots'),
                  compareSnapshots: handleSnaps('compareSnapshots')
                });
              }
            });
          };

          const { place, currentSnapshots: snapshots, compareSnapshots } = data;

          return (
            <Layout loading={loading} title={place && upperFirst(place.name)}>
              <SnapshotsNavigator
                place={place}
                snapshots={snapshots}
                compareSnapshots={compareSnapshots}
                loadMoreSnapshots={loadMoreSnapshots}
              />
            </Layout>
          );
        }}
      </Query>
    );
  }
}
