import { h, Fragment } from 'preact';
import { StateUpdater, useEffect, useState } from 'preact/hooks';
import { Page as PageT, Link } from 'src/types'
import LinkContainer from '../../components/link'
import PageForm from '../../components/form';

interface Props {
    pageId: string,
	editKey?: string,
}

const getPage = async(pageId: string, setPage: StateUpdater<PageT>, editKey: string | undefined) => {
	const params = editKey ? `?pageId=${pageId}&editKey=${editKey}` : `?pageId=${pageId}`;	
	return await fetch(`https://g2bqowyw7g2vnzucnu37zuubmy0xzhjp.lambda-url.us-west-2.on.aws${params}`, {
		method: 'GET',
	})
	.then( resp => resp.json())
	.then( data => setPage(data))
} 

const Page = ({ pageId, editKey }: Props) => {
	const [page, setPage] = useState<PageT>({title: '', links: [], mainDescription: ''})
	useEffect(() => {
		getPage(pageId, setPage, editKey)
	}, []);
    
	const setLink = (link: Link, idx: number) => {
		if(page) {
			var newPage = page
			let updatedLinks = newPage.links
			updatedLinks[idx] = link as Link
			setPage({...newPage, links: [...updatedLinks]})
		}
	}

	const updatePage = async() => {
		await fetch('https://777koiseriztacjrrjgyvt5jsm0zdqiq.lambda-url.us-west-2.on.aws', {
			method: 'POST',
			body: JSON.stringify(page),
		})
		.then( resp => resp.json())
		.then( data => {
			console.log('success')
		})
	}

	return (
		<div class="profile">
			{ page !== undefined ?
				<>
					{ !page.editConfirmationKey ?
						<>
							<h1 class="title">{page.title}</h1>
							<h5 class="description">{page.title}</h5>
						</>
						:
						<>
							<div>
								New Edit Key: {page.editKey}
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
						<button disabled={page.links.length < 2 ? true : false} onClick={() => updatePage()}>Update Page</button>
					}
				</>
				: 'loading'
			}
		</div>
	)
};

export default Page;
