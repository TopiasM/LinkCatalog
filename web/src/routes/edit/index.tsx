import { h, Fragment } from 'preact';
import { StateUpdater, useEffect, useState } from 'preact/hooks';
import { Page as PageT, Link } from 'src/types'
import LinkContainer from '../../components/link'
import PageForm from '../../components/form';
import { staticPageHtml } from '../page/string'
import { pageUpdateApi, pageLoadApi, appUrl, creatingCat } from '../../constants'
import UrlContainer from '../../components/url'
import { route } from 'preact-router'

interface Props {
    pageId: string,
	editKey?: string,
}

const getPage = async(pageId: string, setPage: StateUpdater<PageT>, editKey: string | undefined) => {
	const params = editKey ? `?pageId=${pageId}&editKey=${editKey}` : `?pageId=${pageId}`	
	return await fetch(`${pageLoadApi}${params}`, {
		method: 'GET',
	})
	.then( resp => resp.json())
	.then( data => {
		const page: PageT = data
		if(page.editConfirmationKey) setPage(data)
		else route(`/p/${pageId}`) 
	})
} 

const Page = ({ pageId, editKey }: Props) => {
	const [page, setPage] = useState<PageT>({title: '', links: [], mainDescription: ''})
	const [showOverlay, setShowOverlay] = useState<boolean>(false)
	
	useEffect(() => {
		getPage(pageId, setPage, editKey)
	}, [])
    
	const setLink = (link: Link, idx: number) => {
		if(page) {
			var newPage = page
			let updatedLinks = newPage.links
			updatedLinks[idx] = link as Link
			setPage({...newPage, links: [...updatedLinks]})
		}
	}

	const updatePage = async() => {
		setShowOverlay(true)
		const html = await staticPageHtml(page)
		const pageSend = {...page, html: html}
		await fetch(pageUpdateApi, {
			method: 'POST',
			body: JSON.stringify(pageSend),
		})
		.then( resp => resp.json())
		.then( _data => {
			window.open(`${appUrl}/p/${pageId}`)
		})
	}

	return (
		<div id="edit-page">
			{ page !== undefined ?
				<>
					{ !page.editConfirmationKey ?
						<>
							<h1 class="title">{page.title}</h1>
							<h5 class="description">{page.title}</h5>
						</>
						:
						<>
							<div id="edit-details">
								<label>
									Your new one time edit URL
								</label>
								<UrlContainer url={`${appUrl}/p/${pageId}/e/${page.editKey}`}/>
							</div>
							<PageForm page={page} setPage={setPage} />
						</>
					}
					<div id='link-grid'>
						{ page.links.map((link, idx) => 
							<LinkContainer
								link={link}
								idx={idx}
								setLink={page.editConfirmationKey ? setLink : undefined}
								page={page}
								setPage={setPage}
							/>
						)}
					</div>
					{ page.editConfirmationKey &&
						<button class="update-btn" disabled={page.links.length < 2 ? true : false} onClick={() => updatePage()}>Update Page</button>
					}
				</>
				: 'loading'
			}
			{ showOverlay &&
				<div id="creating-overlay">
					<div class="content">
						<div class="cool-container">
							<img src={creatingCat} />
						</div>
						<h3>Updating Page</h3>
					</div>
				</div>
			}
		</div>
	)
}

export default Page
