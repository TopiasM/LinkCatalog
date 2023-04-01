import { h } from "preact"
import { faClipboard, faArrowUpRightFromSquare} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface Props {
    url: string
}

const UrlContainer = ({url} : Props) => {
	const copyToClipboard = (url: string) => navigator.clipboard.writeText('https://'+url)
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
            </button>
            <button onClick={() => openLink(url)}>
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
            </button>
        </div>
    )
}

export default UrlContainer