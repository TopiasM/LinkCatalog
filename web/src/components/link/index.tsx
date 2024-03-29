import { h } from 'preact'
import { Link, Page } from '../../types'
import { StateUpdater, useEffect } from 'preact/hooks'
import { faTrash, faArrowsUpDownLeftRight, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { assetsUrl } from '../../constants'

interface Props {
    link: Link,
    idx?: number,
    setLink?: (link: Link, idx: number) => void,
    page?: Page,
    setPage?: StateUpdater<Page>,
}

const loadingPulse = `${assetsUrl}/pulse.svg`
const bucketUrl = `${assetsUrl}/screenshots`

export const StaticLinkContainer = ({link} : Props) => {
    return(
        <div class="link-container">
            <img src={`${bucketUrl}/${link.filename}`}/>
            <h3 class="title">{link.title}</h3>
            <p class="description">{link.description}</p>
        </div>
    )
}

const LinkContainer = ({link, idx, setLink, page, setPage} : Props) => {
    const setTextboxRows = (el: HTMLInputElement) => {
        el.setAttribute('style', 'height: ""')
        el.setAttribute('style', `height: ${el.scrollHeight+3}px;`)
    }
    
    useEffect(() => {
        const el = document.getElementsByClassName('title')[0] as HTMLInputElement
        setTextboxRows(el)
    }, [link.title])

    const linkChange = (e: h.JSX.TargetedEvent<HTMLInputElement | HTMLTextAreaElement, Event>) => {
        const el = e.target as HTMLInputElement
        const prop = el.name as keyof Link
        setTextboxRows(el) 
        var updatedLink = link
        updatedLink[prop] = el.value
        setLink!(updatedLink, idx!)
    }
    
    const removeLink = (idx: number | undefined) => {
        if(page != undefined && setPage != undefined && idx != undefined) {
            var newPage = page
            newPage.links.splice(idx, 1)
            setPage({...newPage})
        }
    }

    const swapLinks = (swapIdx: number) => {
        if(page != undefined && setPage != undefined && idx != undefined) {
            const links = page.links
            links.splice(idx, 1, links.splice(swapIdx, 1, links[idx])[0])
            setPage({...page})
        }
    }

    const dragEnd = (e: DragEvent) => {
        const elements = document.elementsFromPoint(e.pageX,e.pageY)
        const targetEl = elements.find(el => (el as HTMLInputElement).className == 'link-container')
        if(targetEl == undefined) return
        const name = targetEl.attributes.getNamedItem('name')?.value
        if(!name) return
        const swapIdx = +(name.split('-')[1])
        if(idx != swapIdx) swapLinks(swapIdx)
    }
	
    const openUrl = (url: string) => window.open(url, '_blank')

    return(
        <div class="link-container" name={`link-${idx}`}>
            <div>
                <span class="visit action" onClick={() => openUrl(link.url)}>
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                </span>
                <span class="del action" onClick={() => removeLink(idx)}>
                    <FontAwesomeIcon icon={faTrash} />
                </span>
                <span class="drag action" draggable={true} onDragEnd={dragEnd}>
                    <FontAwesomeIcon icon={faArrowsUpDownLeftRight} />
                </span>
            </div>
            { (link.filename.length == 0) ?
                <div class="img-placeholder">
                    <img width={50} src={loadingPulse} />
                </div>
                :
                <img alt={`Screenshot of ${link.url}`} src={`${bucketUrl}/${link.filename}`}/>
            }
            <textarea rows={1} class="title" type="text" placeholder="Title" value={link.title} name="title" onInput={e => linkChange(e)}/>
            <textarea rows={2} class="description" placeholder="Description" value={link.description} name="description" onInput={e => linkChange(e)}/>
        </div>
    )
}

export default LinkContainer