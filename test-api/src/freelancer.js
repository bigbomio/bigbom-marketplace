import React, { Component } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Utils from './utils';
import Config from './config';

import './App.css';

const web3 = global.web3;

class Freelancer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false
        };
    }

    async contractInstanceGenerator(type) {
        const defaultAccount = web3.eth.defaultAccount;
        const address = Config.getContract(type).address;
        const abiInstance = web3.eth.contract(Config.getContract(type).abi);
        const instance = await abiInstance.at(address);
        let [, gasPrice] = await Utils.callMethod(web3.eth.getGasPrice)();
        return {
            defaultAccount,
            instance,
            gasPrice,
            address,
            status: ''
        };
    }

    async createBid(jobHash) {
        this.setState({ isLoading: true });
        const BBFreelancerBid = await this.contractInstanceGenerator('BBFreelancerBid');
        console.log(BBFreelancerBid);
        const [err, jobLog] = await Utils.callMethod(BBFreelancerBid.instance.createBid)(jobHash, 400e18, {
            from: BBFreelancerBid.defaultAccount,
            gasPrice: +BBFreelancerBid.gasPrice.toString(10)
        });
        if (err) {
            this.setState({ isLoading: false, status: 'something went wrong! Can not create bid! :(' });
            return console.log(err);
        }
        // check  logs
        this.setState({ isLoading: false, bidAddress: BBFreelancerBid.defaultAccount, status: 'Created!' });
        console.log('joblog bid: ', jobLog);
    }

    async cancelBid(jobHash) {
        this.setState({ isLoading: true });
        const jobInstance = await this.contractInstanceGenerator('BBFreelancerBid');
        const [err, jobLog] = await Utils.callMethod(jobInstance.instance.cancelBid)(jobHash, {
            from: jobInstance.defaultAccount,
            gasPrice: +jobInstance.gasPrice.toString(10)
        });
        if (err) {
            this.setState({ isLoading: false, status: 'something went wrong! Can not cancel bid! :(' });
            return console.log(err);
        }
        // check  logs
        this.setState({ isLoading: false, status: 'Canceled!' });
        console.log('joblog cancel bid: ', jobLog);
    }

    async startJob(jobHash) {
        this.setState({ isLoading: true });
        const jobInstance = await this.contractInstanceGenerator('BBFreelancerJob');
        const [err, jobLog] = await Utils.callMethod(jobInstance.instance.startJob)(jobHash, {
            from: jobInstance.defaultAccount,
            gasPrice: +jobInstance.gasPrice.toString(10)
        });
        if (err) {
            this.setState({ isLoading: false, status: 'something went wrong! Can not start job! :(' });
            return console.log(err);
        }
        // check  logs
        this.setState({ isLoading: false, status: 'Started!' });
        console.log('joblog start: ', jobLog);
    }

    async finishJob(jobHash) {
        this.setState({ isLoading: true });
        const jobInstance = await this.contractInstanceGenerator('BBFreelancerJob');
        const [err, jobLog] = await Utils.callMethod(jobInstance.instance.finishJob)(jobHash, {
            from: jobInstance.defaultAccount,
            gasPrice: +jobInstance.gasPrice.toString(10)
        });
        if (err) {
            this.setState({ isLoading: false, status: 'something went wrong! Can not finish job! :(' });
            return console.log(err);
        }
        // check  logs
        this.setState({ isLoading: false, status: 'Finished!' });
        console.log('joblog finish: ', jobLog);
    }

    async claimPayment(jobHash) {
        this.setState({ isLoading: true });
        const jobInstance = await this.contractInstanceGenerator('BBFreelancerPayment');
        const [err, jobLog] = await Utils.callMethod(jobInstance.instance.claimePayment)(jobHash, {
            from: jobInstance.defaultAccount,
            gasPrice: +jobInstance.gasPrice.toString(10)
        });
        if (err) {
            this.setState({ isLoading: false, status: 'something went wrong! can not claim payment :(' });
            return console.log(err);
        }
        this.setState({ isLoading: false, status: 'Claimed!' });
        console.log('jobLog claim payment: ', jobLog);
    }

    jobHashOnChange(e) {
        const val = e.target.value;
        this.setState({ jobHash: val });
    }

    render() {
        const { isLoading, jobHash, bidAddress, status } = this.state;
        const Loading = () => {
            if (!isLoading) {
                return null;
            }
            return (
                <div className="box-result-loading">
                    <CircularProgress size={50} style={{ color: '#fff' }} />
                    <span>
                        <h2>Waiting...</h2>
                    </span>
                </div>
            );
        };
        return (
            <div className="App container freelancer">
                <header className="App-header">
                    <h1 className="App-title">Freelancer</h1>
                    {bidAddress && <h2 className="app-status">Bid address: {bidAddress}</h2>}
                </header>
                {isLoading ? <Loading /> : <h2 className="app-status">{status}</h2>}
                <p className="App-intro">
                    <input placeholder="Job hash" onChange={e => this.jobHashOnChange(e)} />
                    <button onClick={() => this.createBid(jobHash)}>Create bid</button>
                </p>
                <p>
                    <input placeholder="Job hash" onChange={e => this.jobHashOnChange(e)} />
                    <button onClick={() => this.cancelBid(jobHash)}>Cancel bid</button>
                </p>
                <p>
                    <input placeholder="Job hash" onChange={e => this.jobHashOnChange(e)} />
                    <button onClick={() => this.startJob(jobHash)}>Start Job</button>
                </p>
                <p>
                    <input placeholder="Job hash" onChange={e => this.jobHashOnChange(e)} />
                    <button onClick={() => this.finishJob(jobHash)}>Finish Job</button>
                </p>
                <p>
                    <input placeholder="Job hash" onChange={e => this.jobHashOnChange(e)} />
                    <button onClick={() => this.claimPayment(jobHash)}>Claim payment</button>
                </p>
            </div>
        );
    }
}

export default Freelancer;
