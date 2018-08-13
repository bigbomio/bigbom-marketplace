import React, { Component } from 'react';
import posed from 'react-pose';
import Grid from '@material-ui/core/Grid';
import ButtonBase from '@material-ui/core/ButtonBase';

const connects = [
    {
        logo: '/images/metamask.png',
        name: 'Metamask',
    },
    {
        logo: '/images/trezor.png',
        name: 'Trezor',
    },
    {
        logo: '/images/ledger.png',
        name: 'Ledger',
    },
];

const ContainerProps = {
    open: {
        x: '0%',
        delayChildren: 300,
        staggerChildren: 50,
    },
    closed: {
        delay: 500,
        staggerChildren: 20,
    },
};

const Container = posed.div(ContainerProps);
const Square = posed.div({
    idle: {
        y: 0,
    },
    popped: {
        y: -10,
        transition: { duration: 400 },
    },
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: 300 },
});
class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hovering1: false,
            hovering2: false,
            hovering3: false,
            isLogout: false,
            isLogin: false,
        };
    }

    componentDidMount() {
        this.setState({ isLogout: true });
        document.getElementById('login').style.display = 'none';
    }

    disconnectRender = () => {
        const { isLogout } = this.state;
        return (
            <Container id="intro" className="home-intro sidebar" pose={isLogout ? 'open' : 'closed'}>
                <Square className="col-6">
                    <h1>Hire expert freelancers for any job</h1>
                    <div className="buttons">
                        <ButtonBase className="btn btn-medium btn-white left" onClick={() => this.login()}>
                            Find a Freelancer
                        </ButtonBase>
                        <ButtonBase className="btn btn-medium btn-white" onClick={() => this.login()}>
                            Find a Job
                        </ButtonBase>
                    </div>
                </Square>
                <Square className="col-6">
                    <img src="/images/homebanner.png" alt="" />
                </Square>
            </Container>
        );
    };

    connectRender() {
        const { isLogin } = this.state;
        return (
            <Container id="login" className="home-intro sidebar" pose={isLogin ? 'open' : 'closed'}>
                {connects.map((cn, i) => {
                    const hoverName = 'hovering' + i;
                    return (
                        <Square
                            pose={this.state[hoverName] ? 'popped' : 'idle'}
                            onMouseEnter={() => this.setState({ [hoverName]: true })}
                            onMouseLeave={() => this.setState({ [hoverName]: false })}
                            key={i}
                            className="connect-item-wrp"
                        >
                            <div className="connect-item">
                                <div className="logo">
                                    <img src={cn.logo} alt="" />
                                </div>
                                <div className="name">{cn.name}</div>
                                <ButtonBase className="btn btn-normal btn-white">Connect</ButtonBase>
                            </div>
                        </Square>
                    );
                })}
            </Container>
        );
    }

    login = () => {
        this.setState({ isLogout: false });
        setTimeout(() => {
            document.getElementById('intro').style.display = 'none';
            document.getElementById('login').style.display = 'flex';
            this.setState({ isLogin: true });
        }, 300);
    };

    render() {
        return (
            <div id="home" className="container-wrp">
                <div className="container-wrp home-wrp full-top-wrp">
                    <div className="container wrapper">
                        {this.disconnectRender()}
                        {this.connectRender()}
                    </div>
                </div>
                <div className="container wrapper">
                    <Grid container className="home-content">
                        <Grid container>
                            <h2>Get your job start now...</h2>
                        </Grid>
                        <Grid container>
                            <Grid item xs className="home-content-item">
                                <div className="home-content-img">
                                    <img src="/images/cate1.png" alt="" />
                                </div>
                                <p>Banner Designer</p>
                            </Grid>
                            <Grid item xs className="home-content-item">
                                <div className="home-content-img">
                                    <img src="/images/cate2.png" alt="" />
                                </div>
                                <p>Internet Marketing</p>
                            </Grid>
                            <Grid item xs className="home-content-item">
                                <div className="home-content-img">
                                    <img src="/images/cate3.png" alt="" />
                                </div>
                                <p>Content Marketer</p>
                            </Grid>
                            <Grid item xs className="home-content-item">
                                <div className="home-content-img">
                                    <img src="/images/cate4.png" alt="" />
                                </div>
                                <p>Business Development</p>
                            </Grid>
                            <Grid item xs className="home-content-item ">
                                <div className="home-content-img view-all">View all category</div>
                            </Grid>
                        </Grid>
                    </Grid>
                </div>
            </div>
        );
    }
}

export default Home;
