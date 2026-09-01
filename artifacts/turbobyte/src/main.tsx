import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

if (window.location.hostname === 'turbobyte.pages.dev') {
  setBaseUrl('https://turbobyte.sourabh-daf.workers.dev');
}

createRoot(document.getElementById('root')!).render(<App />);
