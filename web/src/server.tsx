import express from 'express';
import { h } from 'preact';
import { render } from 'preact-render-to-string'
import StaticPage from './routes/page'
import Home from './routes/home'
import CreatePage from './routes/create'
import path from 'path'
import axios from 'axios'
import { Page } from 'src/types'
import fs from 'fs'

const port = 8080
const app = express()

//SSR
const css = fs.readFileSync(path.join(__dirname, '/style', 'index.css'))

app.get('/p/:pageId', async(req, res) => {
    const pageId = req.params.pageId
    const url = `https://g2bqowyw7g2vnzucnu37zuubmy0xzhjp.lambda-url.us-west-2.on.aws?pageId=${pageId}`

    const page: Page = await axios.get<Page>(url)
        .then(res => res.data)

    const tsx = <StaticPage page={page} />
    
    const content = render(tsx)
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
    res.send(html)
})

app.get('/', async(req, res) => {
    const tsx = (
        <Home/>
    )
    const content = render(tsx)

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
    res.send(html)
})

//CSR
app.use(express.static(path.join(__dirname, '../build')))
app.get('/create', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'))
})

app.get('/p/:p/e/:e', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'))
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
