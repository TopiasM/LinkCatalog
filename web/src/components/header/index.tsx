import { h, Fragment } from 'preact';
import { assetsUrl } from '../../constants'
import { Link } from 'preact-router/match';

const logoUrl = `${assetsUrl}/LinkCatalog.svg`

const Header = () => (
	<header class="header">
		<Link href="/">
			<img alt="LinkCatalog logo" width={165.5} height={24} src={logoUrl} />
		</Link>
	</header>
)

export default Header;
