import { Fragment, h } from 'preact';
import { Link, Page } from '../../types'
import { StateUpdater, useEffect, useState } from 'preact/hooks'
import { screenshotApi } from '../../constants'

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

	const formChange = (e: h.JSX.TargetedEvent<HTMLTextAreaElement>) => {
		const el = e.currentTarget
	
		const borderWidth = getComputedStyle(el).borderLeftWidth
		el.setAttribute('style', 'height: ""')
		let height = el.scrollHeight + (+(borderWidth.substring(0,borderWidth.length -2))*2)
		el.setAttribute('style', `height: ${height}px;`)
		
		const prop: string = el.name
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
		await fetch(screenshotApi, {
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
	const urlInputChange = (e: h.JSX.TargetedEvent<HTMLTextAreaElement, Event>) => {
		const el = e.currentTarget 
		const urlInput = el.value
		
		if(encodeURI(urlInput.slice(-1)) == "%0A") { //If Enter pressed
			setUrl('')
			if(validUrl) fetchUrls()
			return	
		}
		
		formChange(e)
		setUrl(urlInput)
		if(urlInput.includes(',')) {
			const urls = urlInput.split(',')
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
				<label>Type web address(es) below</label>
                <textarea rows={1} class="link-input" type="text" autoComplete="off" autoCapitalize="none" autoCorrect="off" value={url} placeholder="" name="links" onInput={urlInputChange}/>
                <button disabled={!validUrl} onClick={fetchUrls}>Fetch</button>
            </div>
        </>
    )

}

export default PageForm