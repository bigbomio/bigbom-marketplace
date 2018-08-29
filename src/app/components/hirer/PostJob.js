import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

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
import { FontAwesomeIcon } from '../../../../node_modules/@fortawesome/react-fontawesome';

const ipfs = abiConfig.getIpfs();

const currencies = settingsApi.getCurrencies();
const categories = settingsApi.getCategories();
const skills = settingsApi.getSkills();
const budgetsSource = settingsApi.getBudgets();

class HirerPostJob extends Component {
    constructor(props) {
        super(props);
        this.state = {
            namePrepare: '',
            desPrepare: '',
            expiredTimePrepare: 0,
            estimatedTimePrepare: 0,
            selectedSkill: [],
            selectedCategory: {},
            selectedCurrency: currencies[0],
            budgets: budgetsSource,
            selectedBudget: budgetsSource[2],
            isLoading: false,
            open: false,
            submitEnable: false,
        };
    }

    async newJobInit(jobHash) {
        const { selectedCategory, selectedBudget, estimatedTimePrepare, expiredTimePrepare } = this.state;
        const { web3 } = this.props;
        const budget = web3.toWei(selectedBudget.min_sum, 'ether');
        const jobInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerJob');
        const expiredTime = parseInt(Date.now() / 1000, 10) + expiredTimePrepare * 24 * 3600;
        const estimatedTime = estimatedTimePrepare * 60 * 60;
        const [err, jobLog] = await Utils.callMethod(jobInstance.instance.createJob)(
            jobHash,
            expiredTime,
            estimatedTime,
            budget,
            selectedCategory.value, // only one category suport for now
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
            console.log(err);
        }
        // check event logs
        if (jobLog) {
            this.setState({
                isLoading: false,
                status: { err: false, text: 'Your job has been created! Please waiting for confirm from your network.' },
            });
            setTimeout(() => {
                this.handleClose();
            }, 2000);
        }
    }

    creatJob = () => {
        const {
            namePrepare,
            desPrepare,
            selectedCurrency,
            selectedBudget,
            selectedSkill,
            estimatedTimePrepare,
            expiredTimePrepare,
            selectedCategory,
        } = this.state;

        let expiredTimeSet = new Date();
        expiredTimeSet.setDate(expiredTimeSet.getDate() + expiredTimePrepare);
        const jobPostData = {
            title: namePrepare,
            description: desPrepare,
            budget: selectedBudget,
            currency: selectedCurrency,
            skills: selectedSkill,
            category: selectedCategory,
            estimatedTime: estimatedTimePrepare,
            expiredTime: expiredTimeSet,
        };
        this.setState({ isLoading: true, open: true });
        ipfs.addJSON(jobPostData, (err, jobHash) => {
            if (err) {
                return console.log(err);
            }
            this.newJobInit(jobHash);
        });
    };

    validateAll = () => {
        const { namePrepare, desPrepare, selectedSkill, estimatedTimePrepare, expiredTimePrepare, selectedCategory } = this.state;
        const title = this.validate(namePrepare, 'title', false);
        const des = this.validate(desPrepare, 'description', false);
        const skills = this.validate(selectedSkill, 'skills', false);
        const category = this.validate(selectedCategory, 'category', false);
        const estimatedTime = this.validate(estimatedTimePrepare, 'estimatedTime', false);
        const expiredTime = this.validate(expiredTimePrepare, 'expiredTime', false);
        if (title && des && skills && category && estimatedTime && expiredTime) {
            this.setState({ submitEnable: true });
        } else {
            this.setState({ submitEnable: false });
        }
    };

    validate = (val, field, setState) => {
        let min = 10;
        let max = 255;
        if (field === 'title') {
            if (val.length < min) {
                if (setState) {
                    this.setState({ nameErr: `Please enter at least  ${min}  characters.` });
                }
                return false;
            } else if (val.length > max) {
                if (setState) {
                    this.setState({ nameErr: `Please enter at most ${max} characters.` });
                }
                return false;
            }
            return true;
        } else if (field === 'description') {
            min = 30;
            max = 4000;
            if (val.length < min) {
                if (setState) {
                    this.setState({ desErr: `Please enter at least ${min} characters.` });
                }
                return false;
            } else if (val.length > max) {
                if (setState) {
                    this.setState({ desErr: `Please enter at most ${max} characters.` });
                }
                return false;
            }
            return true;
        } else if (field === 'skills') {
            if (val.length <= 0) {
                if (setState) {
                    this.setState({ skillsErr: 'Please select at least 1 skill.' });
                }
                return false;
            } else if (val.length > 5) {
                if (setState) {
                    this.setState({ skillsErr: 'Please select at most 5 skills.' });
                }
                return false;
            }
            return true;
        } else if (field === 'category') {
            if (!val.value) {
                if (setState) {
                    this.setState({ categoryErr: 'Please select a category.' });
                }
                return false;
            }
            return true;
        } else if (field === 'estimatedTime') {
            if (val.length <= 0) {
                if (setState) {
                    this.setState({
                        estimatedTimeErr: 'Please enter your estimated time for freelancer complete this job',
                    });
                }
                return false;
            } else {
                if (Number(val) < 1) {
                    if (setState) {
                        this.setState({
                            estimatedTimeErr: 'Please enter your estimated time least 1 hour',
                        });
                    }
                    return false;
                }
            }
            return true;
        } else if (field === 'expiredTime') {
            if (!Number.isInteger(Number(val))) {
                if (setState) {
                    this.setState({
                        expiredTimeErr: 'Must be an integer number.',
                    });
                }
                return false;
            }
            if (Number(val) <= 0) {
                if (setState) {
                    this.setState({
                        expiredTimeErr: 'Please set your expired time for your job',
                    });
                }
                return false;
            } else {
                if (Number(val) < 1) {
                    if (setState) {
                        this.setState({
                            expiredTimeErr: 'Please enter your expired time least 1 day',
                        });
                    }
                    return false;
                } else if (Number(val) > 30) {
                    if (setState) {
                        this.setState({
                            expiredTimeErr: 'Please enter your expired time most 30 days',
                        });
                    }
                    return false;
                }
            }
            return true;
        }
    };

    inputOnChange = (e, field) => {
        const val = e.target.value;
        if (field === 'title') {
            this.setState({ namePrepare: val, nameErr: null });
            if (!this.validate(val, 'title', true)) {
                return;
            }
        } else if (field === 'description') {
            this.setState({ desPrepare: val, desErr: null });
            if (!this.validate(val, 'description', true)) {
                return;
            }
        } else if (field === 'estimatedTime') {
            this.setState({ estimatedTimePrepare: Number(val), estimatedTimeErr: null });
            if (!this.validate(val, 'estimatedTime', true)) {
                return;
            }
        } else if (field === 'expiredTime') {
            this.setState({ expiredTimePrepare: Number(val), expiredTimeErr: null });
            if (!this.validate(val, 'expiredTime', true)) {
                return;
            }
        }
        this.validateAll();
    };

    handleChangeSkills = selectedOption => {
        if (!this.validate(selectedOption, 'skills', true)) {
            return;
        }
        this.setState({ selectedSkill: selectedOption, skillsErr: null });
        this.validateAll();
    };

    handleChangeCategory = selectedOption => {
        if (!this.validate(selectedOption, 'category', true)) {
            return;
        }
        this.setState({ selectedCategory: selectedOption, categoryErr: null });
        this.validateAll();
    };

    handleChangeCurrency = selectedOption => {
        const { budgets } = this.state;
        for (let budget of budgets) {
            budget.currency = selectedOption.label;
        }
        this.setState({ selectedCurrency: selectedOption, budgets: budgets });
        this.validateAll();
    };

    handleChangeBudget = selectedOption => {
        this.setState({ selectedBudget: selectedOption });
        this.validateAll();
    };

    handleClose = () => {
        const { status } = this.state;
        if (!status.err) {
            this.setState({
                open: false,
                namePrepare: '',
                desPrepare: '',
                expiredTimePrepare: 0,
                estimatedTimePrepare: 0,
                selectedSkill: [],
                selectedCategory: {},
                selectedCurrency: currencies[0],
                selectedBudget: budgetsSource[2],
                submitEnable: false,
            });
            document.getElementById('name-ip').value = '';
            document.getElementById('des-ip').value = '';
            document.getElementById('expiredTime').value = '';
            document.getElementById('estimatedTime').value = '';
        } else {
            this.setState({
                open: false,
            });
        }
    };

    render() {
        const {
            selectedSkill,
            selectedCurrency,
            selectedBudget,
            selectedCategory,
            nameErr,
            categoryErr,
            estimatedTimeErr,
            expiredTimeErr,
            desErr,
            skillsErr,
            budgets,
            status,
            open,
            isLoading,
            submitEnable,
            namePrepare,
            desPrepare,
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
                                <span>Waiting...</span>
                            </div>
                        ) : (
                            <div className="alert-dialog-description">
                                {status && (
                                    <div className="dialog-result">
                                        {status.err ? (
                                            <div className="err">{status.text}</div>
                                        ) : (
                                            <div className="success">
                                                <FontAwesomeIcon className="icon" icon="check" />
                                                {status.text}
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
                                Contact skilled freelancers within minutes. View profiles, ratings, portfolios and chat with them. Pay the freelancer
                                only when you are 100% satisfied with their work.
                            </span>
                        </Grid>
                    </div>
                </div>
                <div className="container-wrp main-ct">
                    <div className="container wrapper">
                        <Grid container className="single-body">
                            <Grid item xs={12} className="mkp-form-row">
                                <span className="mkp-form-row-label">Job title</span>
                                <span className="mkp-form-row-description">From 10 to 255 characters</span>
                                <input
                                    type="text"
                                    id="name-ip"
                                    defaultValue={namePrepare}
                                    className={nameErr ? 'input-err' : ''}
                                    onBlur={e => this.inputOnChange(e, 'title')}
                                />
                                {nameErr && <span className="err">{nameErr}</span>}
                            </Grid>
                            <Grid item xs={12} className="mkp-form-row">
                                <span className="mkp-form-row-label">Job description</span>
                                <span className="mkp-form-row-description">
                                    Start with a bit about yourself or your business, and include an overview of what you need done.
                                </span>
                                <textarea
                                    defaultValue={desPrepare}
                                    id="des-ip"
                                    rows="5"
                                    className={desErr ? 'input-err' : ''}
                                    onBlur={e => this.inputOnChange(e, 'description')}
                                />
                                {desErr && <span className="err">{desErr}</span>}
                            </Grid>
                            <Grid container className="mkp-form-row">
                                <Grid item xs={4} className="mkp-form-row-sub left">
                                    <span className="mkp-form-row-label">Category</span>
                                    <span className="mkp-form-row-description">Select a category for your job</span>
                                    <Select
                                        className={categoryErr ? 'react-select input-err' : ''}
                                        value={selectedCategory}
                                        onChange={this.handleChangeCategory}
                                        placeholder="Select..."
                                        options={categories}
                                    />
                                    {categoryErr && <span className="err">{categoryErr}</span>}
                                </Grid>
                                <Grid item xs={8} className="mkp-form-row-sub">
                                    <span className="mkp-form-row-label">What skills are required?</span>
                                    <span className="mkp-form-row-description">Enter up to 5 skills that best describe your project.</span>
                                    <Select
                                        className={skillsErr ? 'react-select input-err' : ''}
                                        value={selectedSkill}
                                        onChange={this.handleChangeSkills}
                                        options={skills}
                                        isClearable={false}
                                        isMulti
                                    />
                                    {skillsErr && <span className="err">{skillsErr}</span>}
                                </Grid>
                            </Grid>
                            <Grid container className="mkp-form-row">
                                <span className="mkp-form-row-label">What is your estimated budget?</span>
                                <Grid item xs={3} className="left">
                                    <Select value={selectedCurrency} onChange={this.handleChangeCurrency} options={currencies} />
                                </Grid>
                                <Grid item xs={9}>
                                    <Select value={selectedBudget} onChange={this.handleChangeBudget} options={budgets} />
                                </Grid>
                            </Grid>
                            <Grid container className="mkp-form-row">
                                <Grid item xs={4} className="mkp-form-row-sub left">
                                    <span className="mkp-form-row-label">Estimated Time</span>
                                    <span className="mkp-form-row-description">Estimated Time (Hour unit)</span>
                                    <input
                                        className={estimatedTimeErr ? 'input-err' : ''}
                                        type="number"
                                        id="estimatedTime"
                                        name="estimatedTime"
                                        min="1"
                                        onChange={e => this.inputOnChange(e, 'estimatedTime')}
                                    />
                                    {estimatedTimeErr && <span className="err">{estimatedTimeErr}</span>}
                                </Grid>
                                <Grid item xs={5} className="mkp-form-row-sub">
                                    <span className="mkp-form-row-label">Expired time</span>
                                    <span className="mkp-form-row-description">After this time freelancer can not bid (Day unit)</span>
                                    <input
                                        className={expiredTimeErr ? 'input-err' : ''}
                                        type="number"
                                        id="expiredTime"
                                        name="expiredTime"
                                        min="1"
                                        onChange={e => this.inputOnChange(e, 'expiredTime')}
                                    />
                                    {expiredTimeErr && <span className="err">{expiredTimeErr}</span>}
                                </Grid>
                            </Grid>
                            <Grid container className="mkp-form-row">
                                <ButtonBase className="btn btn-medium btn-blue create-btn" disabled={!submitEnable} onClick={this.creatJob}>
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
    web3: PropTypes.object.isRequired,
};
const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
    };
};

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(HirerPostJob);
