import React from 'react';
import { Helmet } from 'react-helmet';

export default () => (
    <div className="login">
        <Helmet>
            <title>Login</title>
            <meta name="description" content="Login page" />
        </Helmet>
        <p className="txtIntro">Login</p>
    </div>
);
