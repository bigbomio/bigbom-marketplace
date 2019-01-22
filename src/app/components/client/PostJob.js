import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ReactQuill from 'react-quill';

import Grid from '@material-ui/core/Grid';
import Select from 'react-select';
import ButtonBase from '@material-ui/core/ButtonBase';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';

import 'react-quill/dist/quill.snow.css';

import configs, { postJobConfigs } from '../../_services/configs';
import abiConfig from '../../_services/abiConfig';
import Utils from '../../_utils/utils';

import { getExchangeRates, setCurrentToken } from '../../actions/commonActions';

const ipfs = abiConfig.getIpfs();

const categories = configs.getCategories();
const skills = configs.getSkills();
const budgetsSource = configs.getBudgets();

const modules = {
    toolbar: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ align: ['right', 'center', 'justify'] }],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['link'],
        ['clean'],
    ],
};

let usdInputEl, tokenInputEl;

const formats = ['header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'align', 'list', 'bullet', 'indent', 'link'];

class ClientPostJob extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            namePrepare: '',
            desPrepare: '',
            expiredTimePrepare: 0,
            estimatedTimePrepare: 0,
            selectedSkill: [],
            selectedCategory: {},
            selectedCurrency: { value: 1, label: 'ETH' },
            budgets: budgetsSource,
            isCustomBudget: true,
            selectedBudget: {
                value: new Date().getTime(),
                id: new Date().getTime(),
                min_sum: null,
                max_sum: 0,
                currency: 'BBO',
                get label() {
                    return 'Custom budget ( ' + this.max_sum + '+ ' + this.currency + ')';
                },
            },
            isLoading: false,
            open: false,
            submitDisabled: true,
            status: {
                title: '',
                err: false,
                text: '',
                link: '',
            },
        };
    }

    componentDidMount() {
        const { getExchangeRates } = this.props;
        getExchangeRates();
        this.mounted = true;
        usdInputEl = document.getElementById('usdConverted');
        tokenInputEl = document.getElementById('tokenInput');
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    descriptionOnChange = value => {
        const string = Utils.strimHTML(value);
        this.setState({ desPrepare: value, desErr: null });
        if (!this.validate(string, 'description', true)) {
            this.setState({ submitDisabled: true });
            return;
        }
        setTimeout(() => {
            this.validateAll();
        }, 300);
    };

    async newJobInit(jobHash) {
        const { selectedCategory, selectedBudget, estimatedTimePrepare, expiredTimePrepare, selectedCurrency } = this.state;
        const { web3, tokens } = this.props;
        const budget = Utils.tokenToWei(web3, selectedBudget.max_sum);
        const jobInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerJob');
        const expiredTime = parseInt(Date.now() / 1000, 10) + expiredTimePrepare * 24 * 3600;
        const estimatedTime = estimatedTimePrepare * 60 * 60;
        //let tokenAddress = '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeebb0';
        //if (selectedCurrency.label !== 'ETH') {
        let   tokenAddress = tokens[selectedCurrency.label];
        //}
        const [err, jobTx] = await Utils.callMethod(jobInstance.instance.createJob)(
            jobHash,
            expiredTime,
            estimatedTime,
            budget,
            selectedCategory.value,
            tokenAddress, // only one category suport for now
            {
                from: jobInstance.defaultAccount,
                gasPrice: +jobInstance.gasPrice.toString(10),
            }
        );
        if (err) {
            this.setState({
                isLoading: false,
                status: {
                    title: 'Create New Job: ',
                    err: true,
                    text: 'something went wrong! Can not create job :(',
                    link: '',
                },
            });
            console.log(err);
        }
        // check event logs
        if (jobTx) {
            abiConfig.transactionWatch(web3, jobTx, () => this.createJobDone(jobHash));
        }
    }

    createJobDone = async jobHash => {
        const { web3, history } = this.props;
        const ctInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerJob');
        const content = function() {
            return <span>Your job has been created!</span>;
        };
        this.setState({
            isLoading: false,
            status: {
                title: 'Create New Job: ',
                err: false,
                text: content(),
                link: null,
            },
        });
        setTimeout(async () => {
            const [, jobID] = await Utils.callMethod(ctInstance.instance.getJobID)(jobHash);
            if (jobID) {
                history.push('/client/your-jobs/');
            }
        }, 2000);
    };

    creatJob = () => {
        const { accountInfo } = this.props;
        const defaultWallet = accountInfo.wallets.filter(wallet => wallet.default);
        if (defaultWallet[0].balances.ETH <= 0) {
            this.setState({
                open: true,
                status: {
                    title: 'Error: ',
                    err: true,
                    text: 'Sorry, you have insufficient funds! You can not create a job if your balance less than fee.',
                    link: '',
                },
            });
            return;
        }

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
            created: new Date().getTime(),
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
        const {
            namePrepare,
            desPrepare,
            selectedSkill,
            estimatedTimePrepare,
            expiredTimePrepare,
            selectedCategory,
            isCustomBudget,
            selectedBudget,
        } = this.state;
        const title = this.validate(namePrepare, 'title', false);
        const des = this.validate(desPrepare, 'description', false);
        const skills = this.validate(selectedSkill, 'skills', false);
        const category = this.validate(selectedCategory, 'category', false);
        const estimatedTime = this.validate(estimatedTimePrepare, 'estimatedTime', false);
        const expiredTime = this.validate(expiredTimePrepare, 'expiredTime', false);
        if (isCustomBudget) {
            const customBudget = this.validate(selectedBudget.max_sum, 'customBudget', false);
            if (title && des && skills && category && estimatedTime && expiredTime && customBudget) {
                this.setState({ submitDisabled: false });
            } else {
                this.setState({ submitDisabled: true });
            }
        } else {
            if (title && des && skills && category && estimatedTime && expiredTime) {
                this.setState({ submitDisabled: false });
            } else {
                this.setState({ submitDisabled: true });
            }
        }
    };

    validate = (val, field, setState) => {
        if (field === 'title') {
            if (val.length < postJobConfigs.minTitle) {
                if (setState) {
                    this.setState({ nameErr: `Please enter at least  ${postJobConfigs.minTitle}  characters.` });
                }
                return false;
            } else if (val.length > postJobConfigs.maxTitle) {
                if (setState) {
                    this.setState({ nameErr: `Please enter at most ${postJobConfigs.maxTitle} characters.` });
                }
                return false;
            }
            return true;
        } else if (field === 'description') {
            if (val.length < postJobConfigs.minDescription) {
                if (setState) {
                    this.setState({ desErr: `Please enter at least ${postJobConfigs.minDescription} characters.` });
                }
                return false;
            } else if (val.length > postJobConfigs.maxDescription) {
                if (setState) {
                    this.setState({ desErr: `Please enter at most ${postJobConfigs.maxDescription} characters.` });
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
            if (!val) {
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
                } else if (Number(val) > 6360) {
                    if (setState) {
                        this.setState({
                            estimatedTimeErr: 'Please enter your estimated time most 1 year (6360 Hours)',
                        });
                    }
                    return false;
                }
            }
            return true;
        } else if (field === 'expiredTime') {
            if (!val) {
                if (setState) {
                    this.setState({
                        expiredTimeErr: 'Please set your expired time for your job',
                    });
                }
                return false;
            } else {
                if (!Number.isInteger(Number(val))) {
                    if (setState) {
                        this.setState({
                            expiredTimeErr: 'Must be an integer number.',
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
            }
            return true;
        } else if (field === 'customBudget') {
            if (!val) {
                if (setState) {
                    this.setState({
                        customBudgetErr: 'Please enter your budget!',
                    });
                }
                return false;
            } else {
                if (Number(val.budget) < val.min) {
                    if (setState) {
                        this.setState({
                            customBudgetErr:
                                'Please enter your budget least ' +
                                Utils.currencyFormat(val.min) +
                                ' ' +
                                val.currency +
                                ' (' +
                                postJobConfigs.minBudget +
                                '$)',
                        });
                    }
                    return false;
                } else if (Number(val.budget) > val.max) {
                    if (setState) {
                        this.setState({
                            customBudgetErr:
                                'Please enter your budget most ' +
                                Utils.currencyFormat(val.max) +
                                ' ' +
                                val.currency +
                                ' (' +
                                Utils.currencyFormat(postJobConfigs.maxBudget) +
                                '$)',
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
                this.setState({ submitDisabled: true });
                return;
            }
        } else if (field === 'estimatedTime') {
            this.setState({ estimatedTimePrepare: Number(val), estimatedTimeErr: null });
            if (!this.validate(val, 'estimatedTime', true)) {
                this.setState({ submitDisabled: true });
                return;
            }
        } else if (field === 'expiredTime') {
            this.setState({ expiredTimePrepare: Number(val), expiredTimeErr: null });
            if (!this.validate(val, 'expiredTime', true)) {
                this.setState({ submitDisabled: true });
                return;
            }
        }
        setTimeout(() => {
            this.validateAll();
        }, 300);
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
        const { setCurrentToken, tokens } = this.props;
        for (let budget of budgets) {
            budget.currency = selectedOption.label;
        }
        usdInputEl.value = null;
        tokenInputEl.value = null;
        this.setState({ selectedCurrency: selectedOption, budgets: budgets, customBudgetErr: null });
        //if (selectedOption.label !== 'ETH') {
        const currentToken = {
            symbol: selectedOption.label,
            address: tokens[selectedOption.label],
        };
        setCurrentToken(currentToken);
        //}
    };

    handleChangeBudget = selectedOption => {
        //console.log(selectedOption);
        if (selectedOption.id === 'custom') {
            this.setState({ isCustomBudget: true });
            setTimeout(() => {
                this.validateAll();
            }, 200);
        }
        this.setState({ selectedBudget: selectedOption });
    };

    backToCustom = () => {
        this.setState({ isCustomBudget: false, selectedBudget: budgetsSource[2] });
    };

    budgetHandleInput = (e, currency, rates, convert) => {
        const currentC = rates.filter(rate => rate.symbol === currency);
        const val = Number(e.target.value);
        const min = postJobConfigs.minBudget / Number(currentC[0].price_usd);
        const max = postJobConfigs.maxBudget / Number(currentC[0].price_usd);
        let valValidate = {
            min,
            max,
            budget: val,
            currency,
        };
        const usdConverted =
            val * Number(currentC[0].price_usd) > 1
                ? (val * Number(currentC[0].price_usd)).toFixed(2)
                : (val * Number(currentC[0].price_usd)).toFixed(10);
        const tokenInput =
            val / Number(currentC[0].price_usd) > 1
                ? (val / Number(currentC[0].price_usd)).toFixed(2)
                : (val / Number(currentC[0].price_usd)).toFixed(10);
        let selectedBudget = {
            value: new Date().getTime(),
            id: new Date().getTime(),
            min_sum: null,
            max_sum: 0,
            currency,
            get label() {
                return 'Custom budget ( ' + this.max_sum + '+ ' + this.currency + ')';
            },
        };
        if (convert) {
            selectedBudget.max_sum = tokenInput;
            tokenInputEl.value = tokenInput;
            valValidate.budget = tokenInput;
        } else {
            usdInputEl.value = usdConverted;
            selectedBudget.max_sum = val;
        }

        this.setState({ selectedBudget, customBudgetErr: null });
        if (!this.validate(valValidate, 'customBudget', true)) {
            this.setState({ submitDisabled: true });
            return;
        }
        setTimeout(() => {
            this.validateAll();
        }, 200);
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
                selectedCurrency: { value: '1', label: 'ETH' },
                selectedBudget: budgetsSource[2],
                submitDisabled: true,
                desErr: null,
                nameErr: null,
                categoryErr: null,
                skillsErr: null,
                estimatedTimeErr: null,
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
            estimatedTimePrepare,
            expiredTimePrepare,
            nameErr,
            categoryErr,
            estimatedTimeErr,
            expiredTimeErr,
            desErr,
            skillsErr,
            budgets,
            status,
            isCustomBudget,
            customBudgetErr,
            open,
            isLoading,
            submitDisabled,
            namePrepare,
            desPrepare,
        } = this.state;

        const { rates, currencies } = this.props;
        let selectedCurrencyDefault = selectedCurrency;

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
                    <DialogTitle id="alert-dialog-title">{status.title}</DialogTitle>
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
                                                <i className="fas fa-check icon" />
                                                {status.text}
                                                {status.link && (
                                                    <p>
                                                        View your transaction status{' '}
                                                        <a className="bold link" href={status.link} target="_blank" rel="noopener noreferrer">
                                                            HERE
                                                        </a>
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <ButtonBase onClick={this.handleClose} className="btn btn-normal btn-default">
                            Close
                        </ButtonBase>
                    </DialogActions>
                </Dialog>
                <div className="container-wrp full-top-wrp">
                    <div className="container wrapper">
                        <Grid container className="main-intro">
                            <h1>Tell your freelancer what you need to be done</h1>
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
                                    onChange={e => this.inputOnChange(e, 'title')}
                                />
                                {nameErr && <span className="err">{nameErr}</span>}
                            </Grid>
                            <Grid item xs={12} className="mkp-form-row">
                                <span className="mkp-form-row-label">Job description</span>
                                <span className="mkp-form-row-description">
                                    Start with a bit about yourself or your business, and include an overview of what you need done.
                                </span>
                                <ReactQuill
                                    id="des-ip"
                                    className="description-text"
                                    value={desPrepare}
                                    onChange={this.descriptionOnChange}
                                    modules={modules}
                                    formats={formats}
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
                                    {currencies.length > 0 ? (
                                        <Select value={selectedCurrencyDefault} onChange={this.handleChangeCurrency} options={currencies} />
                                    ) : null}
                                </Grid>
                                <Grid item xs={9}>
                                    {!isCustomBudget ? (
                                        <Select value={selectedBudget} onChange={this.handleChangeBudget} options={budgets} />
                                    ) : (
                                        <Grid container>
                                            <Grid item xs={5}>
                                                <Grid container>
                                                    <Grid item xs={10}>
                                                        <input
                                                            className={customBudgetErr ? 'input-err' : ''}
                                                            type="number"
                                                            id="tokenInput"
                                                            name="customBudget"
                                                            disabled={rates.length < 0}
                                                            placeholder="Enter your budget..."
                                                            onChange={e => this.budgetHandleInput(e, selectedCurrencyDefault.label, rates, false)}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={2} className="currency">
                                                        {selectedCurrencyDefault.label}
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={1} className="convert">
                                                <i className="fas fa-arrows-alt-h" />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Grid container>
                                                    <Grid item xs={10}>
                                                        <input
                                                            className={customBudgetErr ? 'input-err' : ''}
                                                            id="usdConverted"
                                                            type="number"
                                                            name="customBudget"
                                                            disabled={rates.length < 0}
                                                            onChange={e => this.budgetHandleInput(e, selectedCurrencyDefault.label, rates, true)}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={2} className="currency">
                                                        USD
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={12}>
                                                {customBudgetErr && <span className="err">{customBudgetErr}</span>}
                                            </Grid>
                                        </Grid>
                                    )}
                                </Grid>
                            </Grid>
                            <Grid container className="mkp-form-row">
                                <Grid item xs={5} className="mkp-form-row-sub left">
                                    <span className="mkp-form-row-label">Estimated Time</span>
                                    <span className="mkp-form-row-description">Time estimated for completing this job</span>
                                    <span className="input-unit">
                                        <input
                                            className={estimatedTimeErr ? 'input-err' : ''}
                                            type="number"
                                            id="estimatedTime"
                                            name="estimatedTime"
                                            min="1"
                                            onChange={e => this.inputOnChange(e, 'estimatedTime')}
                                        />
                                        <span>
                                            Hour
                                            {estimatedTimePrepare > 1 ? 's' : ''}
                                        </span>
                                    </span>
                                    {estimatedTimeErr && <span className="err">{estimatedTimeErr}</span>}
                                </Grid>
                                <Grid item xs={5} className="mkp-form-row-sub">
                                    <span className="mkp-form-row-label">Expired time</span>
                                    <span className="mkp-form-row-description">Maximum bid period</span>
                                    <span className="input-unit">
                                        <input
                                            className={expiredTimeErr ? 'input-err' : ''}
                                            type="number"
                                            id="expiredTime"
                                            name="expiredTime"
                                            min="1"
                                            onChange={e => this.inputOnChange(e, 'expiredTime')}
                                        />
                                        <span>
                                            Day
                                            {expiredTimePrepare > 1 ? 's' : ''}
                                        </span>
                                    </span>
                                    {expiredTimeErr && <span className="err">{expiredTimeErr}</span>}
                                </Grid>
                            </Grid>
                            <Grid container className="mkp-form-row">
                                <ButtonBase className="btn btn-medium btn-blue create-btn" disabled={submitDisabled} onClick={this.creatJob}>
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

ClientPostJob.propTypes = {
    web3: PropTypes.object.isRequired,
    accountInfo: PropTypes.any.isRequired,
    getExchangeRates: PropTypes.func.isRequired,
    rates: PropTypes.array.isRequired,
    tokens: PropTypes.object,
    currencies: PropTypes.array.isRequired,
    setCurrentToken: PropTypes.func.isRequired,
};
const mapStateToProps = state => {
    return {
        web3: state.HomeReducer.web3,
        accountInfo: state.CommonReducer.accountInfo,
        rates: state.CommonReducer.rates,
        tokens: state.CommonReducer.tokens,
        currencies: state.CommonReducer.currencies,
    };
};

const mapDispatchToProps = {
    getExchangeRates,
    setCurrentToken,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ClientPostJob);
