import { graphql } from "react-apollo";
import gql from "graphql-tag";

import Layout from "../modules/layout";
import { PlaceList } from "../modules/place";

function byMostRecentSnapshot(a, b) {
  return (
    new Date(b.mostRecentSnapshot.date) - new Date(a.mostRecentSnapshot.date)
  );
}

class FrontPage extends React.Component {
  static graphSettings = {
    query: gql`
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
    `,
    props: ({ data }) => {
      const { places } = data;
      if (places) {
        return {
          data: {
            ...data,
            places: places.sort(byMostRecentSnapshot)
          }
        };
      }
      return {
        data
      };
    },
    options: () => ({})
  };

  render() {
    const { loading, places } = this.props.data;

    return (
      <Layout loading={loading} title="Værhøna">
        <PlaceList places={places} />
      </Layout>
    );
  }
}

export default graphql(FrontPage.graphSettings.query, FrontPage.graphSettings)(
  FrontPage
);
