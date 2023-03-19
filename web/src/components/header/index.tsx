import { h, Fragment } from 'preact';

const logoUrl = 'https://linkcatalog-bucket-test.s3.us-west-2.amazonaws.com/assets/LinkCatalog.svg';

const Header = () => (
	<>
		<header class="header">
			<a href="/">
				<img alt="LinkCatalog logo" width={165.5} height={24} src={logoUrl} />
			</a>
		</header>
		<br/>
	</>
)

export default Header;
