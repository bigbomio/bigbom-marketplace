import React, { PureComponent } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

const asynComponent = importComponent => {
    class AsyncComponent extends PureComponent {
        constructor(props) {
            super(props);
            this.state = {
                component: null,
            };
        }

        componentDidMount() {
            this.mounted = true;
            this.commponentInit();
        }

        componentWillUnmount() {
            this.mounted = false;
        }

        commponentInit = async () => {
            const { default: component } = await importComponent();
            if (this.mounted) {
                if (component) {
                    this.setState({
                        component: component,
                    });
                }
            }
        };

        render() {
            const { component: C } = this.state;

            return C ? (
                <C {...this.props} />
            ) : (
                <div className="container-wrp">
                    <div className="container wrapper">
                        <div className="loading">
                            <CircularProgress size={50} color="secondary" />
                            <span>Loading...</span>
                        </div>
                    </div>
                </div>
            );
        }
    }

    return AsyncComponent;
};

export default asynComponent;
