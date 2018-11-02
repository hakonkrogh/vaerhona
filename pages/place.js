import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import upperFirst from 'upper-case-first';

import { graphDate } from 'core/date';
import Layout from '../modules/layout';
import { SnapshotsNavigator } from '../modules/snapshot';

function bySnapshotDate(a, b) {
  return new Date(a.date) - new Date(b.date);
}

function onlyUniqueSnapshots(value, index, self) {
  return self.findIndex(v => v.cuid === value.cuid) === index;
}

class PlacePage extends React.Component {
  static graphSettings = {
    query: gql`
      query PlaceData(
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
    `,

    options: ctx => {
      const now = new Date();

      const to = graphDate(now);

      now.setFullYear(now.getFullYear() - 1);
      const compareTo = graphDate(now);

      return {
        variables: {
          placeName: ctx.router.asPath.replace(/^\//, ''),
          limit: 24,
          to,
          compareTo
        }
      };
    },

    props: ({ data }) => {
      return {
        data,
        loadMoreSnapshots: ({ from, to, limit }) => {
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

          return data.fetchMore({
            variables: {
              ...data.variables,
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
        }
      };
    }
  };

  render() {
    const { data, loadMoreSnapshots } = this.props;
    const {
      loading,
      place,
      currentSnapshots: snapshots,
      compareSnapshots
    } = data;

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
  }
}

export default graphql(PlacePage.graphSettings.query, PlacePage.graphSettings)(
  PlacePage
);
