import { h, Fragment } from 'preact';
import { Page } from 'src/types'
import Footer from '../../components/footer'
import { renderToString } from 'preact-render-to-string'

const bucketUrl = "https://linkcatalog-bucket-test.s3.us-west-2.amazonaws.com/public/screenshots"

export const staticPageHtml = async(page: Page) => {
    const tsx = (
        <>
            <h1 class="title">{page.title}</h1>
            <h5 class="description">{page.mainDescription}</h5>
            <div id='link-grid'>
                { page.links.map(link => 
                    <div class="link-container">
                        <img src={`${bucketUrl}/${link.filename}`}/>
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
                <style>${css}</style>
            </head>
            <body>
                ${content}
            </body>
        </html>
    `;

    return html
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
	min-height: 100vh;
    position: relative;
	height: auto;
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

.header {
	text-align: left;
}

.header img {
	float: left;
	margin-bottom: 12px;
}

footer {
	position: absolute;
	right: 10px;
    bottom: 0px;
	padding-bottom: 8px;
}

footer > h4 {
	display: inline;
}

footer img {
	vertical-align: text-bottom;
}
`;