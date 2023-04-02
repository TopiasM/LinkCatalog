import { h } from "preact"
import { faClipboard, faArrowUpRightFromSquare} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from "preact/hooks"

interface Props {
    url: string
}

const UrlContainer = ({url} : Props) => {
	const [copiedPopover, setCopiedPopover] = useState<boolean>(false)
	const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText('https://'+url)
        setCopiedPopover(true)
        setTimeout(() => {
            setCopiedPopover(false)
        }, 2000)
    }
	const openLink = (url: string) => window.open('https://'+url, '_blank')

    const denyInput = (e: h.JSX.TargetedEvent<HTMLInputElement>, value: string) => {
		const el = e.target as HTMLInputElement
		el.value = value
	}
    
    return (
        <div class="url-container">
            <input value={url} onInput={(e) => denyInput(e, url)}></input>
            <button onClick={() => copyToClipboard(url)}>
                <FontAwesomeIcon icon={faClipboard} />
                { copiedPopover ? 'Copied' : 'Copy' }
            </button>
            <button onClick={() => openLink(url)}>
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                Open
            </button>
        </div>
    )
}

export default UrlContainer