import { h, Fragment } from 'preact';
import { Page } from 'src/types'
import Footer from '../../components/footer'
import { renderToString } from 'preact-render-to-string'
import { assetsUrl } from '../../constants'

const screenshotsUrl = `${assetsUrl}/screenshots`
const stylesUrl = `${assetsUrl}/page.css`

export const staticPageHtml = async(page: Page) => {
    const tsx = (
        <>
            <h1 class="title">{page.title}</h1>
            <h5 class="description">{page.mainDescription}</h5>
            <div id='link-grid'>
                { page.links.map(link => 
                    <div class="link-container">
						<a href={link.url}>
                        	<img src={`${screenshotsUrl}/${link.filename}`}/>
						</a>
                        <h3 class="title">{link.title}</h3>
                        <p class="description">{link.description}</p>
                    </div>
                )}
            </div>
            <Footer />
        </>
    )

    const content = renderToString(tsx)
    
    const html = `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8">
                <title>Page</title>
                <meta name="viewport" content="width=device-width,initial-scale=1">
                <meta name="mobile-web-app-capable" content="yes">
                <meta name="apple-mobile-web-app-capable" content="yes">
				<link href="${stylesUrl}" rel="stylesheet" type="text/css">
            </head>
            <body>
                ${content}
            </body>
        </html>
    `;

    return html
}