import { h, Fragment } from 'preact'
import { useState } from 'preact/hooks'
import LinkContainer from '../../components/link'
import PageForm from '../../components/form'
import { Page, Link } from '../../types'
import Header from '../../components/header'
import StaticPage from '../page'
import { renderToString } from 'preact-render-to-string'

interface PageDetails {
	editKey: string,
	pageId: string,
	status: number,
	editExpireTime: string,
	html?: string
}

const bucketUrl = "https://linkcatalog-bucket-test.s3.us-west-2.amazonaws.com/public/screenshots"

const CreatePage = () => {
	const [page, setPage] = useState<Page>({title: '', links: [], mainDescription: ''})
	const [pageDetails, setPageDetails] = useState<PageDetails | undefined>(undefined)

	const setLink = (link: Link, idx: number) => {
		var newPage = page
		let updatedLinks = newPage.links
		updatedLinks[idx] = link as Link
		setPage({...newPage, links: [...updatedLinks]})
	}

	const getHtml = async() => {
		const p = page
		console.log(p)
		const tsx = (
			<>
				<h1 class="title">{page.title}</h1>
				<h5 class="description">{page.mainDescription}</h5>
				<div id='link-grid'>
					{ page.links.map((link, idx) => 
						<div class="link-container">
							<img src={`${bucketUrl}/${link.filename}`}/>
							<h3 class="title">{link.title}</h3>
							<p class="description">{link.description}</p>
						</div>
					)}
				</div>
			</>
		)

		/*let tries = 0
		const maxDepth = 5
		const render = () => {
			if (++tries > maxDepth) return
			try {
				return renderToString(tsx)
			} catch (e) {
				render()
			}
		};*/
		const content = renderToString(tsx)
		/*<style>${css}</style>*/
		const html = `
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="utf-8">
					<title>Page</title>
					<meta name="viewport" content="width=device-width,initial-scale=1">
					<meta name="mobile-web-app-capable" content="yes">
					<meta name="apple-mobile-web-app-capable" content="yes">
					<style>${css}</style>
				</head>
				<body>
					${content}
				</body>
			</html>
		`;

		return html
	}

	const createPage = async() => {
		const html = await getHtml()
		const pageSend = {...page, html: html}

		await fetch(`https://jf2wdbekknrtowflhtdaw2xrpm0wjdyc.lambda-url.us-west-2.on.aws`, {
			method: 'POST',
			body: JSON.stringify(pageSend),
		})
		.then( resp => resp.json())
		.then( data => {
			setPageDetails(data)
		})
	}

    return(
		<>
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
		</>
	);
};

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

const css = `
:root {
	--title-size: calc(1.375rem + 1.5vw);
	--description-size: 1.25rem;
	--link-title-size: 1.15rem;
	--link-description-size: 1rem;
	--description-weight: 300;
	--grid-breakpoint: 768px;
	--text-color: #222;
	--bg-color: #f2f2f2;
	--border-color: #0002;
}

html, body {
	height: 100%;
	width: 100%;
	padding: 0;
	margin: 0;
	background: var(--bg-color);
	font-family: 'Helvetica Neue', arial, sans-serif;
	font-weight: 400;
	color: var(--text-color);
	display: block;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

* {
	box-sizing: border-box;
}

body {
	padding: 20px 10px;
	max-width: 1320px;
	text-align: center;
	margin: auto;
}

input:not(.link-input), textarea {
	width: 100%;
    background-color: #fff0;
    text-align: center;
    border: var(--border-color) 1.5px dashed;
	overflow: hidden;
	resize: none;
}

#link-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 20px;
}

#link-grid > div {
	padding: 12px 0px;
}

@media(max-width: 768px) {
	#link-grid { grid-template-columns: 100%; }
}


/** From components/pages **/

.create-btn {
    width: 100%;
    background-color: var(--text-color);
    color: var(--bg-color);
    font-size: 1.25rem;
    padding: 6px;
    border-radius: 5px;
	margin-bottom: 30px;
	cursor: pointer;
}

.url-container {
    display: flex;
}

.url-container > input {
    font-size: 1.3rem;
} 

.profile {
	min-height: 100%;
	width: 100%;
}

.title {
	font-size: var(--title-size);
	margin: 8px 0px;
}

.description {
	font-size: var(--description-size);
	font-weight: var(--description-weight);
	margin: 6px 0px;
}

input {
	width: 100%;
}

.link-container > img, .img-placeholder {
	width: 100%;
	border-radius: 1%;
	aspect-ratio: 16 / 9;
	border: 1px solid #ddd;
}

.img-placeholder {
	background-color: #e3e3e3;
	display: flex;
    align-items: center;
    justify-content: center;
}

.link-container > .title {
	font-size: var(--link-title-size);
	margin: 6px 0px;
}

.link-container > .description {
	font-size: var(--link-description-size);
	margin: 2px 0px;
	white-space: pre-wrap;
}

@media(min-width: 769px) {
	.link-container:last-child:nth-of-type(odd) {
		place-self: center;
		grid-column: 1/-1;
		max-width: calc(50% - 10px);
		width: 100%;
	}
}


.container > textarea {
	font-size: var(--description-size);
	font-weight: var(--description-weight);
	margin: 6px 0px;
}

.container > .title {
	font-size: var(--title-size);
	margin: 8px 0px;
}

#link-form > .link-area {
	text-align: left;
}

input:focus::placeholder, textarea:focus::placeholder {
  color: transparent;
}

.action {
	float: right;
	margin: 0px 2px 2px 8px;
	color: var(--text-color);
	font-size: 18px;
}

.action:hover {
	color: #444;
}

.action.drag {
	cursor: move;
}

.action.del {
	cursor: pointer;
}

.header {
	text-align: left;
}

.header img {
	float: left;
	margin-bottom: 12px;
}
`;

export default CreatePage;
