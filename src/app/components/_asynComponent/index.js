import React, { PureComponent } from 'react';

const asynComponent = importComponent => {
    class AsyncComponent extends PureComponent {
        constructor(props) {
            super(props);
            this.state = {
                component: null
            };
        }

        async componentDidMount() {
            const { default: component } = await importComponent();
            if (component) {
                this.setState({
                    component: component
                });
            }
        }

        render() {
            const { component: C } = this.state;

            return C ? <C {...this.props} /> : <div className="loading">Loading...</div>;
        }
    }

    return AsyncComponent;
};

export default asynComponent;
