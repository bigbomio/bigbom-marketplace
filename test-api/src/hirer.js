import React, { Component } from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import IPFS from 'ipfs-mini';
import Utils from './utils';
import Config from './config';

import './App.css';

const web3 = global.web3;
const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

class Hirer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false
        };
    }

    async getListJob() {
        this.setState({ isLoading: true });
        const jobInstance = await this.contractInstanceGenerator('BBFreelancerJob');
        const [err, jobLog] = await Utils.callMethod(jobInstance.instance.getPastEvents)('JobCreated', {
            filter: { owner: jobInstance.defaultAccount, category: ['banner', 'it'] }, // filter by owner, category
            fromBlock: 0, // should use recent number
            toBlock: 'latest'
        });
        if (err) {
            this.setState({ isLoading: false, status: 'something went wrong! can not get list job :(' });
            return console.log(err);
        }
        this.setState({ isLoading: false, status: 'Get list job success!' });
        console.log('jobLog get list job: ', jobLog);
    }

    async getJob(jobHash) {
        this.setState({ isLoading: true });
        const jobInstance = await this.contractInstanceGenerator('BBFreelancerJob');
        const [err, jobLog] = await Utils.callMethod(jobInstance.instance.getJob)(jobHash, {
            from: jobInstance.defaultAccount,
            gasPrice: +jobInstance.gasPrice.toString(10)
        });
        if (err) {
            this.setState({ isLoading: false, status: 'something went wrong! can not get job :(' });
            return console.log(err);
        }
        this.setState({ isLoading: false, status: 'Get job success!' });
        console.log('jobLog get job: ', jobLog);
    }

    async contractInstanceGenerator(type) {
        const defaultAccount = web3.eth.defaultAccount;
        const address = Config.getContract(type).address;
        const abiInstance = web3.eth.contract(Config.getContract(type).abi);
        const instance = await abiInstance.at(address);
        const gasPrice = await Utils.callMethod2(web3.eth.getGasPrice)();
        return {
            defaultAccount,
            instance,
            gasPrice,
            address
        };
    }

    async newJobInit(jobHash) {
        const jobInstance = await this.contractInstanceGenerator('BBFreelancerJob');
        const expiredTime = parseInt(Date.now() / 1000) + 7 * 24 * 3600; // expired after 7 days
        // createJob: jobHash, expiredTime, budget, category
        const [err, jobLog] = await Utils.callMethod(jobInstance.instance.createJob)(
            jobHash,
            expiredTime,
            500e18,
            'banner',
            {
                from: jobInstance.defaultAccount,
                gasPrice: +jobInstance.gasPrice.toString(10)
            }
        );
        if (err) {
            this.setState({ isLoading: false, status: 'something went wrong! Can not create job :(' });
            return console.log(err);
        }
        // check event logs
        this.setState({ isLoading: false, status: 'Created!' });
        console.log('joblog: ', jobLog);
        ipfs.catJSON(jobHash, (err, data) => {
            console.log(err, 'data: ', data);
        });
    }

    // create new job
    createNewJob() {
        const { data } = this.state;
        const jobData = { somevalue: data, name: 'Nick' };
        this.setState({ isLoading: true });
        ipfs.addJSON(jobData, (err, jobHash) => {
            if (err) {
                return console.log(err);
            }
            console.log('jobHash: ', jobHash);
            this.setState({ jobHash: jobHash });
            this.newJobInit(jobHash);
        });
    }

    async cancelJob(jobHash) {
        this.setState({ isLoading: true });
        const jobInstance = await this.contractInstanceGenerator('BBFreelancerJob');
        const [err, jobLog] = await Utils.callMethod(jobInstance.instance.cancelJob)(jobHash, {
            from: jobInstance.defaultAccount,
            gasPrice: +jobInstance.gasPrice.toString(10)
        });
        if (err) {
            this.setState({ isLoading: false, status: 'something went wrong! can not cancel job :(' });
            return console.log(err);
        }
        this.setState({ isLoading: false, status: 'Canceled!' });
        console.log('jobLog cancel: ', jobLog);
    }

    async acceptBid(jobHash) {
        this.setState({ isLoading: true });
        const { bidAddress } = this.state;
        const BBOinstance = await this.contractInstanceGenerator('BigbomTokenExtended');
        const BidInstance = await this.contractInstanceGenerator('BBFreelancerBid');
        const [errApprove, approve] = await Utils.callMethod2(BBOinstance.instance.approve)(
            BidInstance.address,
            400e18,
            {
                from: BBOinstance.defaultAccount,
                gasPrice: +BBOinstance.gasPrice.toString(10)
            }
        );
        if (errApprove) {
            this.setState({ isLoading: false, status: 'something went wrong! Can not approve bid! :(' });
            return console.log('errApprove: ', errApprove);
        }
        console.log('approve: ', approve);
        const [errAccept, jobLogAccept] = await Utils.callMethod(BidInstance.instance.acceptBid)(jobHash, bidAddress, {
            from: BidInstance.defaultAccount,
            gasPrice: +BidInstance.gasPrice.toString(10)
        });
        if (errAccept) {
            this.setState({ isLoading: false, status: 'something went wrong! Can not accept bid! :(' });
            return console.log('errAccept', errAccept);
        }
        this.setState({ isLoading: false, status: 'Accepted!' });
        console.log('jobLogAccept: ', jobLogAccept);
    }

    async rejectPayment(jobHash) {
        this.setState({ isLoading: true });
        const jobInstance = await this.contractInstanceGenerator('BBFreelancerPayment');
        const [err, jobLog] = await Utils.callMethod(jobInstance.instance.rejectPayment)(jobHash, {
            from: jobInstance.defaultAccount,
            gasPrice: +jobInstance.gasPrice.toString(10)
        });
        if (err) {
            this.setState({ isLoading: false, status: 'something went wrong! can not reject payment :(' });
            return console.log(err);
        }
        this.setState({ isLoading: false, status: 'Rejected!' });
        console.log('jobLog reject payment: ', jobLog);
    }

    async acceptPayment(jobHash) {
        this.setState({ isLoading: true });
        const jobInstance = await this.contractInstanceGenerator('BBFreelancerPayment');
        const [err, jobLog] = await Utils.callMethod(jobInstance.instance.acceptPayment)(jobHash, {
            from: jobInstance.defaultAccount,
            gasPrice: +jobInstance.gasPrice.toString(10)
        });
        if (err) {
            this.setState({ isLoading: false, status: 'something went wrong! can not accept payment :(' });
            return console.log(err);
        }
        this.setState({ isLoading: false, status: 'Accepted!' });
        console.log('jobLog accept payment: ', jobLog);
    }

    dataOnChange(e) {
        const val = e.target.value;
        this.setState({ data: val });
    }

    jobHashOnChange(e) {
        const val = e.target.value;
        this.setState({ jobHash: val });
    }

    bidAddressOnChange(e) {
        const val = e.target.value;
        this.setState({ bidAddress: val });
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
            <div className="App container">
                <header className="App-header">
                    <h1 className="App-title">Hirer</h1>
                    {jobHash && <h2 className="app-status">Jobhash: {jobHash}</h2>}
                </header>
                {isLoading ? <Loading /> : <h2 className="app-status">{status}</h2>}
                <p className="App-intro">
                    <input placeholder="Job data" onChange={e => this.dataOnChange(e)} />
                    <button onClick={() => this.createNewJob()}>Create Job</button>
                </p>
                <p>
                    <input placeholder="Job hash" onChange={e => this.jobHashOnChange(e)} />
                    <button onClick={() => this.cancelJob(jobHash)}>Cancel Job</button>
                </p>
                <p>
                    <input placeholder="address bid" onChange={e => this.bidAddressOnChange(e)} />
                    <input placeholder="Job hash" onChange={e => this.jobHashOnChange(e)} />
                    <button onClick={() => this.acceptBid(jobHash, bidAddress)}>Accept Bid</button>
                </p>
                <p>
                    <input placeholder="Job hash" onChange={e => this.jobHashOnChange(e)} />
                    <button onClick={() => this.rejectPayment(jobHash)}>Reject Payment</button>
                </p>
                <p>
                    <input placeholder="Job hash" onChange={e => this.jobHashOnChange(e)} />
                    <button onClick={() => this.acceptPayment(jobHash)}>Accept Payment</button>
                </p>
                <p>
                    <input placeholder="Job hash" onChange={e => this.jobHashOnChange(e)} />
                    <button onClick={() => this.getJob(jobHash)}>Get job detail</button>
                </p>
                <p>
                    <input placeholder="Job hash" onChange={e => this.jobHashOnChange(e)} />
                    <button onClick={() => this.getListJob()}>Get my list job</button>
                </p>
            </div>
        );
    }
}

export default Hirer;
