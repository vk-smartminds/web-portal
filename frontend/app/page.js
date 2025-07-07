import dynamic from 'next/dynamic';
const Home = dynamic(() => import('../pages/Home'));

export default function Page() {
  return <Home />;
}
