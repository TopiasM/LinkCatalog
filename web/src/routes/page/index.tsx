import { h, Fragment } from 'preact';
import { Page } from 'src/types'
import Footer from '../../components/footer'
import { StaticLinkContainer } from '../../components/link'

interface Props {
    page: Page,
}

const StaticPage = ({ page }: Props) => (  
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
		<Footer />
	</>
)

export default StaticPage
