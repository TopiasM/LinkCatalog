import { h, Fragment } from 'preact'
import { StateUpdater, useState } from 'preact/hooks'
import LinkContainer from '../../components/link'
import UrlContainer from '../../components/url'
import PageForm from '../../components/form'
import { Page, Link } from '../../types'
import Header from '../../components/header'
import { staticPageHtml } from '../page/string'
import { pageCreateApi, assetsUrl, appUrl } from '../../constants'

interface PageDetails {
	editKey: string,
	pageId: string,
	status: number,
	editExpireTime: string,
	html?: string
}

const creatingCat = `${assetsUrl}/creating-cat.jpg`
const createdCat = `${assetsUrl}/created-cat.jpg`

const emptyPage = {title: '', links: [], mainDescription: ''}

const CreatePage = () => {
	const [page, setPage] = useState<Page>(emptyPage)
	const [pageDetails, setPageDetails] = useState<PageDetails | undefined>(undefined)
	const [showOverlay, setShowOverlay] = useState<boolean>(false)

	const setLink = (link: Link, idx: number) => {
		var newPage = page
		let updatedLinks = newPage.links
		updatedLinks[idx] = link as Link
		setPage({...newPage, links: [...updatedLinks]})
	}

	const createPage = async() => {
		const html = await staticPageHtml(page)
		const pageSend = {...page, html: html}

		setShowOverlay(true)
		await fetch(pageCreateApi, {
			method: 'POST',
			body: JSON.stringify(pageSend),
		})
		.then( resp => resp.json())
		.then( data => {
			setPageDetails(data)
			setShowOverlay(false)
		})
	}

    return(
		<>
			<link rel="prefetch" href={creatingCat} />
			<Header></Header>
			<div>
				{ !pageDetails ?
					<>
						<PageForm page={page} setPage={setPage} />
						<div id='link-grid'>
							{ page.links.map((link, idx) =>
								<LinkContainer
									link={link}
									idx={idx}
									setLink={setLink}
									page={page}
									setPage={setPage} />
							)}
						</div>
						{ page.links.length > 1 &&
							<button class="create-btn" disabled={page.links.length < 2 ? true : false} onClick={() => createPage()}>
								Create Page
							</button>
						}
					</>
					:
					<PageCreated pageDetails={pageDetails} setPageDetails={setPageDetails} setPage={setPage} />
				}
			</div>
			{ showOverlay &&
				<div id="creating-overlay">
					<div class="content">
						<div class="cool-container">
							<img src={creatingCat} />
						</div>
						<h3>Creating Page</h3>
					</div>
				</div>
			}
		</>
	)
}

interface CreatedProps {
	pageDetails: PageDetails,
	setPageDetails: StateUpdater<PageDetails | undefined>,
	setPage: StateUpdater<Page>
}

const PageCreated = ({pageDetails, setPageDetails, setPage}: CreatedProps) => {
	const pageUrl = `${appUrl}/p/${pageDetails.pageId}`
	const pageEditUrl = `${appUrl}/p/${pageDetails.pageId}/e/${pageDetails.editKey}`

	const resetState = () => {
		setPage({...emptyPage, links: []})
		setPageDetails(undefined)
	}

	return(
		<div>
			<img class="created-img" src={createdCat} />
			<h1>Your page has been created successfully</h1>
			<UrlContainer url={pageUrl}/>
			<br/>
			<div id="edit-details">
				<label>
					You can use the following URL to edit the page once.
				</label>
				<UrlContainer url={pageEditUrl}/>
				<label>
					The URL will expire in 2 weeks and you'll be provided a new one time URL once you visit the page.
				</label>
			</div>
			<a class="create-another" onClick={resetState}>Create a another page</a>	
		</div>
	)
}


export default CreatePage