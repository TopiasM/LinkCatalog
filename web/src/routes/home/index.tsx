import { h, Fragment } from 'preact'
import Header from '../../components/header'
import { Link } from 'preact-router/match';

const Home = () => (
	<>
		<Header></Header>
		<h1>Home</h1>
		<Link href="/create">
			<button>Create Page</button>
		</Link>
	</>
);

export default Home;
