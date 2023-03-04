import { h, Fragment } from 'preact';
import { Page } from 'src/types'
import { StaticLinkContainer } from '../../components/link'

interface Props {
    page: Page,
}

const StaticPage = ({ page }: Props) => {
	return(
		<>
			<h1 class="title">{page.title}</h1>
			<h5 class="description">{page.mainDescription}</h5>
			<div id='link-grid'>
				{ page.links.map((link, idx) => 
					<StaticLinkContainer
						link={link}
						idx={idx}
					/>
				)}
			</div>
		</>
	)
}

export default StaticPage;
