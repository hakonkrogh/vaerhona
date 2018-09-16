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
      query PlaceData($placeName: String!, $from: String, $to: String) {
        place(name: $placeName) {
          name
        }

        snapshots(place: $placeName, from: $from, to: $to) {
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
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 1);

      return {
        variables: {
          placeName: ctx.router.asPath.replace(/^\//, ""),
          from: from.toString(),
          to: to.toString()
        }
      };
    },

    props: ({ data }) => {
      return {
        data,
        loadMoreSnapshots: ({ from, to }) => {
          return data.fetchMore({
            variables: {
              ...data.variables,
              from: from.toString(),
              to: to.toString()
            },
            updateQuery: (previousResult, { fetchMoreResult }) => {
              if (!fetchMoreResult.snapshots) {
                return Object.assign({}, previousResult, {
                  from,
                  to
                });
              }

              return Object.assign({}, previousResult, {
                from,
                to,
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
