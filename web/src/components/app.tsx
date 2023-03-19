import { h, Fragment } from 'preact'
import { Route, Router } from 'preact-router'
import Home from '../routes/home'
import Edit from '../routes/edit'
import Create from '../routes/create'
import NotFound from '../routes/404'

const App = () => (
    <main>
        <Router>
            <Route path="/" component={Home} />
            <Route path="/create" component={Create} />
            <Route path="/p/:pageId/e/:editKey" component={Edit} />
            <Route path="/empty" component={() => <></>} />
            <Route default component={NotFound} />
        </Router>
    </main>
)

export default App;
