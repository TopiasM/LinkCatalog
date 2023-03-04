import { h } from 'preact'
import Header from '../../components/header'
//import './style.css'

const Home = () => (
	<div>
		<Header></Header>
		<h1>Home</h1>
		<a href="/create">
			<button>Create Page</button>
		</a>
	</div>
);

export default Home;
