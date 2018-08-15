import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import Select from 'react-select';
import ButtonBase from '@material-ui/core/ButtonBase';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';

import settingsApi from '../../_services/settingsApi';
import abiConfig from '../../_services/abiConfig';
import Utils from '../../_utils/utils';

const ipfs = abiConfig.getIpfs();

const currencies = settingsApi.getCurrencies();
const categories = settingsApi.getCategories();
const budgetsSource = settingsApi.getBudgets();

class HirerPostJob extends Component {
    constructor(props) {
        super(props);
        this.state = {
            namePrepare: '',
            desPrepare: '',
            selectedSkill: [],
            selectedCurrency: currencies[0],
            budgets: budgetsSource,
            selectedBudget: budgetsSource[2],
            isLoading: false,
            open: false,
        };
    }

    async contractInstanceGenerator(type) {
        const { defaultAccount, web3 } = this.props;
        const address = abiConfig.getContract(type).address;
        const abiInstance = web3.eth.contract(abiConfig.getContract(type).abi);
        const instance = await abiInstance.at(address);
        const gasPrice = await Utils.callMethodWithReject(web3.eth.getGasPrice)();
        return {
            defaultAccount,
            instance,
            gasPrice,
            address,
        };
    }

    async newJobInit(jobHash) {
        const { selectedSkill } = this.state;
        const jobInstance = await this.contractInstanceGenerator('BBFreelancerJob');
        const expiredTime = parseInt(Date.now() / 1000, 10) + 7 * 24 * 3600; // expired after 7 days
        const [err, jobLog] = await Utils.callMethod(jobInstance.instance.createJob)(
            jobHash,
            expiredTime,
            500e18,
            selectedSkill[0].value,
            {
                from: jobInstance.defaultAccount,
                gasPrice: +jobInstance.gasPrice.toString(10),
            }
        );
        if (err) {
            this.setState({
                isLoading: false,
                status: { err: true, text: 'something went wrong! Can not create job :(' },
            });
            return console.log(err);
        }
        // check event logs
        this.setState({ isLoading: false, status: { err: false, text: 'Your job has been created!' } });
        console.log('joblog: ', jobLog);
        ipfs.catJSON(jobHash, (err, data) => {
            console.log(err, 'data: ', data);
        });
    }

    creatJob = () => {
        const { namePrepare, desPrepare, selectedCurrency, selectedBudget, selectedSkill } = this.state;
        const name = this.validate(namePrepare, 'name');
        const des = this.validate(desPrepare, 'description');
        const skills = this.validate(selectedSkill, 'skills');
        if (name && des && skills) {
            const jobPostData = {
                name: namePrepare,
                description: desPrepare,
                budget: selectedBudget,
                currency: selectedCurrency,
                category: selectedSkill,
            };
            this.setState({ isLoading: true, open: true });
            ipfs.addJSON(jobPostData, (err, jobHash) => {
                if (err) {
                    return console.log(err);
                }
                console.log('jobHash: ', jobHash);
                this.setState({ jobHash });
                this.newJobInit(jobHash);
            });
            console.log(jobPostData);
        }
    };

    validate = (val, field) => {
        let min = 10;
        let max = 255;
        if (field === 'name') {
            if (val.length < min) {
                this.setState({ nameErr: 'Please enter at least 10 characters.' });
                return false;
            } else if (val.length > max) {
                this.setState({ nameErr: 'Please enter at most 255 characters.' });
                return false;
            }
            return true;
        } else if (field === 'description') {
            min = 30;
            max = 4000;
            if (val.length < min) {
                this.setState({ desErr: 'Please enter at least 30 characters.' });
                return false;
            } else if (val.length > max) {
                this.setState({ desErr: 'Please enter at most 4000 characters.' });
                return false;
            }
            return true;
        } else if (field === 'skills') {
            if (val.length <= 0) {
                this.setState({ skillsErr: 'Please choise at least 1 skill.' });
                return false;
            } else if (val.length > 5) {
                this.setState({ skillsErr: 'Please choise at most 5 skills.' });
                return false;
            }
            return true;
        }
    };

    inputOnChange = (e, field) => {
        const val = e.target.value;
        if (field === 'name') {
            if (!this.validate(val, 'name')) {
                return;
            }
            this.setState({ namePrepare: val, nameErr: null });
        } else {
            if (!this.validate(val, 'description')) {
                return;
            }
            this.setState({ desPrepare: val, desErr: null });
        }
    };

    handleChangeSkills = selectedOption => {
        if (!this.validate(selectedOption, 'skills')) {
            return;
        }
        this.setState({ selectedSkill: selectedOption, skillsErr: null });
    };

    handleChangeCurrency = selectedOption => {
        const { budgets } = this.state;
        for (let budget of budgets) {
            budget.currency = selectedOption.label;
        }
        this.setState({ selectedCurrency: selectedOption, budgets: budgets });
    };

    handleChangeBudget = selectedOption => {
        this.setState({ selectedBudget: selectedOption });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    render() {
        const {
            selectedSkill,
            selectedCurrency,
            selectedBudget,
            nameErr,
            desErr,
            skillsErr,
            budgets,
            status,
            open,
            isLoading,
            jobHash,
        } = this.state;
        return (
            <div className="container-wrp">
                <Dialog
                    open={open}
                    onClose={this.handleClose}
                    maxWidth="sm"
                    fullWidth
                    className="dialog"
                    disableBackdropClick
                    disableEscapeKeyDown
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">Create New Job:</DialogTitle>
                    <DialogContent>
                        {isLoading ? (
                            <div className="loading">
                                <CircularProgress size={50} color="secondary" />
                                <span>Loading...</span>
                            </div>
                        ) : (
                            <div className="alert-dialog-description">
                                {status && (
                                    <div className="dialog-result">
                                        {status.err ? (
                                            <div className="err">{status.text}</div>
                                        ) : (
                                            <div className="success">
                                                {status.text}
                                                <p>
                                                    <Link to={'/freelancer/jobs/' + jobHash}>View Your Job</Link>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                    <DialogActions>
                        {!isLoading && (
                            <ButtonBase onClick={this.handleClose} className="btn btn-normal btn-default">
                                Close
                            </ButtonBase>
                        )}
                    </DialogActions>
                </Dialog>
                <div className="container-wrp full-top-wrp">
                    <div className="container wrapper">
                        <Grid container className="main-intro">
                            <h1>Tell your freenlancer what you need done</h1>
                            <span className="description">
                                Contact skilled freelancers within minutes. View profiles, ratings, portfolios and chat
                                with them. Pay the freelancer only when you are 100% satisfied with their work.
                            </span>
                        </Grid>
                    </div>
                </div>
                <div className="container-wrp main-ct">
                    <div className="container wrapper">
                        <Grid container className="single-body">
                            <Grid item xs={12} className="mkp-form-row">
                                <span className="mkp-form-row-label">Job name</span>
                                <span className="mkp-form-row-description">From 10 to 255 characters</span>
                                <input
                                    type="text"
                                    className={nameErr ? 'input-err' : ''}
                                    onBlur={e => this.inputOnChange(e, 'name')}
                                />
                                {nameErr && <span className="err">{nameErr}</span>}
                            </Grid>
                            <Grid item xs={12} className="mkp-form-row">
                                <span className="mkp-form-row-label">Job description</span>
                                <span className="mkp-form-row-description">
                                    Start with a bit about yourself or your business, and include an overview of what
                                    you need done.
                                </span>
                                <textarea
                                    rows="5"
                                    className={desErr ? 'input-err' : ''}
                                    onBlur={e => this.inputOnChange(e, 'description')}
                                />
                                {desErr && <span className="err">{desErr}</span>}
                            </Grid>
                            <Grid item xs={12} className="mkp-form-row">
                                <span className="mkp-form-row-label">What skills are required?</span>
                                <span className="mkp-form-row-description">
                                    Enter up to 5 skills that best describe your project. Freelancers will use these
                                    skills to find projects they are most interested and experienced in.
                                </span>
                                <Select
                                    className={skillsErr ? 'input-err' : ''}
                                    value={selectedSkill}
                                    onChange={this.handleChangeSkills}
                                    options={categories}
                                    isMulti
                                />
                                {skillsErr && <span className="err">{skillsErr}</span>}
                            </Grid>
                            <Grid container className="mkp-form-row">
                                <span className="mkp-form-row-label">What is your estimated budget?</span>
                                <Grid item xs={4} className="left">
                                    <Select
                                        value={selectedCurrency}
                                        onChange={this.handleChangeCurrency}
                                        options={currencies}
                                    />
                                </Grid>
                                <Grid item xs={8}>
                                    <Select
                                        value={selectedBudget}
                                        onChange={this.handleChangeBudget}
                                        options={budgets}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container className="mkp-form-row">
                                <ButtonBase className="btn btn-normal btn-blue" onClick={this.creatJob}>
                                    Create Job
                                </ButtonBase>
                            </Grid>
                        </Grid>
                    </div>
                </div>
            </div>
        );
    }
}

HirerPostJob.propTypes = {
    defaultAccount: PropTypes.string.isRequired,
};
const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
        defaultAccount: state.homeReducer.defaultAccount,
    };
};

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(HirerPostJob);
