import { graphql } from "react-apollo";
import gql from "graphql-tag";

import Layout from "../modules/layout";
import { SnapshotsNavigator } from "../modules/snapshot";

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
        $limit: Int
      ) {
        place(name: $placeName) {
          name
        }

        snapshots(place: $placeName, from: $from, to: $to, limit: $limit) {
          cuid
          date
          temperature
          humidity
          pressure
          image
        }
      }
    `,

    options: ctx => {
      return {
        variables: {
          placeName: ctx.router.asPath.replace(/^\//, ""),
          limit: 24
        }
      };
    },

    props: ({ data }) => {
      return {
        data,
        loadMoreSnapshots: ({ from, to, limit }) => {
          return data.fetchMore({
            variables: {
              ...data.variables,
              from: from && new Date(from).toISOString(),
              to: to && new Date(to).toISOString(),
              limit
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
              if (
                !fetchMoreResult.snapshots ||
                fetchMoreResult.snapshots.length === 0
              ) {
                return previousResult;
              }

              return Object.assign({}, previousResult, {
                snapshots: [
                  ...previousResult.snapshots,
                  ...fetchMoreResult.snapshots
                ]
                  .filter(onlyUniqueSnapshots)
                  .sort(bySnapshotDate)
              });
            }
          });
        }
      };
    }
  };

  render() {
    const { data, loadMoreSnapshots } = this.props;
    const { loading, place, snapshots } = data;

    return (
      <Layout loading={loading} title={place && place.name}>
        <SnapshotsNavigator
          place={place}
          snapshots={snapshots}
          loadMoreSnapshots={loadMoreSnapshots}
        />
      </Layout>
    );
  }
}

export default graphql(PlacePage.graphSettings.query, PlacePage.graphSettings)(
  PlacePage
);
