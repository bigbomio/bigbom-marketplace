import React, { PureComponent } from 'react';
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

const Square = posed.div({
    idle: {
        y: 0,
    },
    popped: {
        y: -10,
        transition: { duration: 400 },
    },
});
class Home extends PureComponent {
    state = {
        hovering1: false,
        hovering2: false,
        hovering3: false,
    };
    disconnectRender() {
        return (
            <Grid container className="home-intro">
                <Grid item xs={6}>
                    <h1>Hire expert freelancers for any job</h1>
                    <div className="buttons">
                        <ButtonBase className="btn btn-medium btn-white left">Find a Freelancer</ButtonBase>
                        <ButtonBase className="btn btn-medium btn-white">Find a Job</ButtonBase>
                    </div>
                </Grid>
                <Grid item xs={6}>
                    <img src="/images/homebanner.png" alt="" />
                </Grid>
            </Grid>
        );
    }

    connectRender() {
        return (
            <Grid container className="home-intro">
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
            </Grid>
        );
    }

    render() {
        return (
            <div id="home" className="container-wrp">
                <div className="container-wrp home-wrp full-top-wrp">
                    {/* <div className="container wrapper">{this.disconnectRender()}</div> */}
                    <div className="container wrapper">{this.connectRender()}</div>
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
