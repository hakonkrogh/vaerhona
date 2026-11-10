import { useRestoreScrollOnBack } from 'core/page-transition';
import {
  latestByPlace,
  useRefreshWhenNewer,
} from 'core/use-refresh-when-newer';
import { useReloadOnRestore } from 'core/use-reload-on-restore';
import Layout from 'modules/layout';
import styles from 'modules/layout/message.module.css';
import PlaceList from 'modules/place-list';
import { getFrontPageProps } from 'services/front-page';

export default function FrontPage({ places }) {
  useReloadOnRestore();
  useRestoreScrollOnBack('front-page');
  useRefreshWhenNewer('/api/latest', places ? latestByPlace(places) : null);

  return (
    <Layout title="Værhøna" scroll>
      {!places && (
        <p className={styles.message}>
          Fikk ikke hentet stedene. Prøv igjen om litt.
        </p>
      )}
      {places && !places.length && (
        <p className={styles.message}>Ingen steder ennå.</p>
      )}
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
