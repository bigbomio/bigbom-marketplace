import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { MuiThemeProvider } from '@material-ui/core/styles';

// Font Awesome

// Service Worker
import { unregister } from './registerServiceWorker';

// Store
import storeConfig, { browserHistory } from './app/stores';

// Custom
import { muiDefault as muiTheme } from './material-ui-theme';

// Add CSS
import './styles/index.css';

import Routes from './app/routers';

ReactDOM.render(
    <div className="App" id="bigbomMarketplace">
        <Provider store={storeConfig()}>
            <MuiThemeProvider theme={muiTheme}>
                <Routes history={browserHistory} />
            </MuiThemeProvider>
        </Provider>
    </div>,
    document.getElementById('root')
);
unregister();
