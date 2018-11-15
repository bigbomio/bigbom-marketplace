import React from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';

export default () => (
    <div className="loading">
        <CircularProgress size={50} color="secondary" />
        <span>Loading...</span>
    </div>
);
