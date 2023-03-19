import { h, Fragment } from 'preact'
import Header from '../../components/header'
//import './style.css'

const Home = () => (
	<>
		<Header></Header>
		<h1>Home</h1>
		<a href="/create">
			<button>Create Page</button>
		</a>
	</>
);

export default Home;
