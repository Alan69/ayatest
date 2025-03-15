import { render } from 'solid-js/web';
import { Router } from '@solidjs/router';
import { Provider } from 'solid-urql';
import { createClient } from './api/client';
import App from './App';
import './index.css';

const client = createClient();

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