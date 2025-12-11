import React from 'react';
import ReactDOM from 'react-dom/client';
// BrowserRouter 대신 HashRouter를 가져옵니다.
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* HashRouter로 감싸면 주소에 #이 붙으면서 404 에러가 사라집니다 */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
