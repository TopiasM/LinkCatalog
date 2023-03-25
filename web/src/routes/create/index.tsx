import { h, Fragment } from 'preact'
import { useState } from 'preact/hooks'
import LinkContainer from '../../components/link'
import PageForm from '../../components/form'
import { Page, Link } from '../../types'
import Header from '../../components/header'
import { staticPageHtml } from '../page/string'
import { pageCreateApi, assetsUrl } from '../../constants'

interface PageDetails {
	editKey: string,
	pageId: string,
	status: number,
	editExpireTime: string,
	html?: string
}

const creatingCat = `${assetsUrl}/creating-catalog.jpg`

const CreatePage = () => {
	const [page, setPage] = useState<Page>({title: '', links: [], mainDescription: ''})
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
			<div class='container'>
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
					<PageCreated pageDetails={pageDetails}/>
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
}

const PageCreated = ({pageDetails}: CreatedProps) => {
	const pageUrl = `/p/${pageDetails.pageId}`
	const pageEditUrl = `/p/${pageDetails.pageId}/e/${pageDetails.editKey}`

	const denyInput = (e: h.JSX.TargetedEvent<HTMLInputElement>, value: string) => {
		const el = e.target as HTMLInputElement
		el.value = value
	}

	const copyToClipboard = (url: string) => navigator.clipboard.writeText(url)

	const openLink = (url: string) => window.open(url, '_blank')

	return(
		<div>
			<h1>Page Created Successfully</h1>
			<div class="url-container">
				<input value={pageUrl} onInput={(e) => denyInput(e, pageUrl)}></input>
				<button onClick={() => copyToClipboard(pageUrl)}>copy</button>
				<button onClick={() => openLink(pageUrl)}>Visit</button>
			</div>
			<br/>
			<div class="url-container">
				<input value={pageEditUrl} onInput={(e) => denyInput(e, pageUrl)}></input>
				<button onClick={() => copyToClipboard(pageEditUrl)}>copy</button>
				<button onClick={() => openLink(pageEditUrl)}>Visit</button>
			</div>
		</div>
	)
}


export default CreatePage