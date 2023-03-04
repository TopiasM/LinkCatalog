import { Fragment, h } from 'preact';
import { Link, Page } from '../../types'
import { StateUpdater, useEffect, useState } from 'preact/hooks'

interface Props {
    page: Page,
    setPage: StateUpdater<Page>,
}

const multiFetchDelay = 500

const PageForm = ({page, setPage} : Props) => {
    const [url, setUrl] = useState<string>('')
    const [validUrl, setValidUrl] = useState<boolean>(false)
	const [newLinkIdx, setNewLinkIdx] = useState<number>(page.links.length)
	const [newLink, setNewLink] = useState<{idx: number, link: Link} | undefined>(undefined)

	useEffect(() => {
		if(newLink) {
			let updatedLinks = page.links
			updatedLinks[newLink.idx] = newLink.link
			setPage({...page, links: [...updatedLinks]})
		}
	}, [newLink])

	// Updates newLinkIdx when link is deleted 
	useEffect(() => {
		if(newLinkIdx != 0 && page.links.length != newLinkIdx) setNewLinkIdx(page.links.length)
	}, [page])

	const formChange = (e: h.JSX.TargetedEvent<HTMLInputElement | HTMLTextAreaElement, Event>) => {
		const el = e.target as HTMLInputElement
		const prop: string = el.name 
		
		if(prop === 'mainDescription') { // Hack for description textarea to stretch so text fits
			el.setAttribute('style', 'height: ""')
			el.setAttribute('style', `height: ${el.scrollHeight+3}px;`)
		}
		
		if(prop === 'title' || prop === 'mainDescription') {
			var newPage = page
			newPage[prop] = el.value
			setPage(newPage)
		}
	}
	
    const fetchUrls = async() => {
		const urls: string = url
		setUrl('')
		setValidUrl(false)
		if(urls.includes(',')) {
			const idx = newLinkIdx
			const urlArr = urls.split(',')
			setNewLinkIdx(newLinkIdx + urlArr.length)
			urlArr.forEach((u, i) => {
				const delay = i*multiFetchDelay; 
				delayedFetchUrl(u, delay, idx+i)
			})	
		} else {
			const idx = newLinkIdx
			setNewLinkIdx(idx+1)
			fetchUrl(urls, idx)
		} 
	}

	const delayedFetchUrl = async(url: string, ms: number, idx: number) => {
		const delay = (ms: number) => {
			return new Promise( resolve => setTimeout(resolve, ms) );
		}

		await delay(ms)
		fetchUrl(url, idx)
	}
	
	const checkError = (resp: Response, idx: number) => {
		if(!resp.ok) {
			removeLink(idx)
			throw Error(resp.statusText)
		}
		return resp.json()
	}

	const fetchUrl = async(url: string, idx: number) => {
		let loadingLink = {url: url, filename: '', description: '', title: `Fetching ${url}`}
		setNewLink({link: loadingLink, idx: idx})
		await fetch(`https://l7jfni4okyw3323pt6qyuwut640xinsv.lambda-url.us-west-2.on.aws`, {
			method: 'POST',
			body: url,
		})
		.then( resp => checkError(resp, idx))
		.then( data => setNewLink({link: data, idx: idx}))
		.catch( err => console.log(err))
	}
	
    const removeLink = (idx: number) => {
		var newPage = page
		newPage.links.splice(idx, 1)
		setPage({...newPage})
	}

	const urlPattern = /([a-z,0-9]+\.+[a-z])./;
	const urlInputChange = (url: string) => {
		setUrl(url)
		if(url.includes(',')) {
			const urls = url.split(',')
			const tests = urls.map(u => urlPattern.test(u))
			const valid = tests.includes(false) ? false : true;
			setValidUrl(valid)
			return
		}
      	setValidUrl((urlPattern.test(url) && url.length > 3))
	}

    return(
        <>
            <form class="container">
                <textarea class="title" rows={1} type="text" placeholder="Title" value={page.title} name="title" onInput={formChange}/>
                <textarea rows={2} placeholder="Description" value={page.mainDescription} name="mainDescription" onInput={formChange}/>
            </form>
            <div id="link-form">
                <textarea rows={1} class="link-area" type="text" autoComplete="off" value={url} placeholder="Type a web address(es) here" name="link" onInput={e => urlInputChange((e.target as HTMLInputElement).value)}/>
                <button disabled={!validUrl} onClick={fetchUrls}>fetch</button>
            </div>
        </>
    )

}

export default PageForm