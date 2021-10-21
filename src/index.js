import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Redirect } from 'react-router-dom';
import { store } from './store.js';
import { Provider } from 'react-redux';
import App from './App';
import LandingPage from './components/LandingPage/LandingPage';
import 'bootstrap/dist/css/bootstrap.min.css'

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <React.StrictMode>
        {/* <Route exact path="/" component={LandingPage} /> > This allows us to show the landing page */}
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
        <Route path='/:page' component={App} />
      </React.StrictMode>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
