import { h, Fragment } from 'preact';
import { assetsUrl } from '../../constants'

const logoUrl = `${assetsUrl}/LinkCatalog.svg`

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
