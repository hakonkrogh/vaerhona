import { graphql } from "react-apollo";
import gql from "graphql-tag";

import Layout from "../modules/layout";
import { PlaceList } from "../modules/place";

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

export default graphql(FrontPage.graphSettings.query)(FrontPage);
