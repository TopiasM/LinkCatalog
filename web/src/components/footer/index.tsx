import { h, Fragment } from 'preact';
import { assetsUrl } from '../../constants'

const logoUrl = `${assetsUrl}/LinkCatalog.svg`;

const Footer = () => (
	<footer>
		<h4>Page created using </h4>
		<a href="/">
			<img height={16} src={logoUrl} />
		</a>
	</footer>
)

export default Footer
