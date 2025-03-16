import { render } from 'solid-js/web';
import { Router } from '@solidjs/router';
import { Provider } from '@urql/solid';
import { createClient as createUrqlClient } from './api/client';
import App from './App';
import './index.css';

const client = createUrqlClient();

render(
  () => (
    <Router>
      <Provider value={client}>
        <App />
      </Provider>
    </Router>
  ),
  document.getElementById('root')
); 