import styled from 'styled-components';

import { useRestoreScrollOnBack } from 'core/page-transition';
import {
  latestByPlace,
  useRefreshWhenNewer,
} from 'core/use-refresh-when-newer';
import { useReloadOnRestore } from 'core/use-reload-on-restore';
import Layout from 'modules/layout';
import PlaceList from 'modules/place-list';
import { getFrontPageProps } from 'services/front-page';

const Message = styled.p`
  padding: 30px 15px;
  text-align: center;
`;

export default function FrontPage({ places }) {
  useReloadOnRestore();
  useRestoreScrollOnBack('front-page');
  useRefreshWhenNewer('/api/latest', places ? latestByPlace(places) : null);

  return (
    <Layout title="Værhøna" scroll>
      {!places && (
        <Message>Fikk ikke hentet stedene. Prøv igjen om litt.</Message>
      )}
      {places && !places.length && <Message>Ingen steder ennå.</Message>}
      {places?.length > 0 && <PlaceList places={places} />}
    </Layout>
  );
}

// Runs on every request and is not cached, because the page must show the
// latest snapshot of each place (rule F6 in SPEC.md).
export async function getServerSideProps({ res }) {
  const props = await getFrontPageProps();

  if (!props.places) {
    res.statusCode = 503;
  }

  return { props };
}
