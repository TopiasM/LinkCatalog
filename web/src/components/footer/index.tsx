import { h, Fragment } from 'preact';

const logoUrl = 'https://linkcatalog-bucket-test.s3.us-west-2.amazonaws.com/assets/LinkCatalog.svg';

const Footer = () => (
	<footer>
		<h4>Page created using </h4>
		<a href="/">
			<img height={16} src={logoUrl} />
		</a>
	</footer>
)

export default Footer
