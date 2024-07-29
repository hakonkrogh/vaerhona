import dynamic from 'next/dynamic';

const FrontPage = dynamic(() => import('../modules/frontpage'), { ssr: false });

export default function FrontPageLoader() {
  return <FrontPage />;
}
