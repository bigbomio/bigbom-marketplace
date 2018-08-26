import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import Select from 'react-select';
import ButtonBase from '@material-ui/core/ButtonBase';
import CircularProgress from '@material-ui/core/CircularProgress';
import SearchInput, { createFilter } from 'react-search-input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import Utils from '../../_utils/utils';
import settingsApi from '../../_services/settingsApi';
import abiConfig from '../../_services/abiConfig';

let jobs = [];

const options = ['Latest', 'Oldest', 'Lowest Budget', 'Highest Budget', 'Most Bids', 'Fewest Bids'];
const KEYS_TO_FILTERS = ['owner', 'title', 'description'];

class JobBrowser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null,
            selectedIndex: 1,
            searchTerm: '',
            isLoading: false,
            Jobs: [],
            stt: { err: false, text: null },
            completed: 0,
        };
        this.timer = null;
    }

    componentDidMount() {
        const { isConnected } = this.props;
        const { isLoading } = this.state;
        if (isConnected) {
            if (!isLoading) {
                this.getJobs();
                this.mounted = true;
                this.timer = setInterval(this.progress, 1000);
            }
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        clearInterval(this.timer);
    }

    getJobs = () => {
        const { web3 } = this.props;
        this.setState({ isLoading: true, Jobs: [], completed: 0 });
        jobs = [];
        abiConfig.getPastSingleEvent(web3, 'BBFreelancerJob', 'JobCreated', {}, this.JobCreatedInit);
    };

    getBiddingStt(stts) {
        if (stts[3]) {
            return false;
        } else if (Number(stts[1].toString()) <= Math.floor(Date.now() / 1000) ? true : false) {
            return false;
        } else if (stts[5] !== '0x0000000000000000000000000000000000000000') {
            return false;
        }
        return true;
    }

    JobCreatedInit = async eventLog => {
        const { web3 } = this.props;
        const event = eventLog.data;
        if (!eventLog.data) {
            this.setState({ stt: { err: true, text: 'Have no any job to show!' }, isLoading: false });
            return;
        }
        const jobHash = Utils.toAscii(event.args.jobHash);
        // get job status
        const jobInstance = await abiConfig.contractInstanceGenerator(web3, 'BBFreelancerJob');
        const [err, jobStatusLog] = await Utils.callMethod(jobInstance.instance.getJob)(jobHash, {
            from: jobInstance.defaultAccount,
            gasPrice: +jobInstance.gasPrice.toString(10),
        });
        if (err) {
            return console.log(err);
        } else {
            // [owner, expired, budget, cancel, status, freelancer]
            const jobStatus = {
                started: Number(jobStatusLog[4].toString()) === 1,
                completed: Number(jobStatusLog[4].toString()) === 2,
                claimed: Number(jobStatusLog[4].toString()) === 5,
                reject: Number(jobStatusLog[4].toString()) === 4,
                paymentAccepted: Number(jobStatusLog[4].toString()) === 9,
                canceled: jobStatusLog[3],
                bidAccepted: jobStatusLog[5] !== '0x0000000000000000000000000000000000000000',
                bidding: this.getBiddingStt(jobStatusLog),
                expired: Number(jobStatusLog[1].toString()) <= Math.floor(Date.now() / 1000) ? true : false,
            };
            if (jobStatus.bidding) {
                // get detail from ipfs
                const URl = abiConfig.getIpfsLink() + jobHash;
                const jobTpl = {
                    id: event.args.jobHash,
                    owner: event.args.owner,
                    jobHash: jobHash,
                    category: Utils.toAscii(event.args.category),
                    expired: event.args.expired.toString(),
                    status: jobStatus,
                    bid: [],
                };
                fetch(URl)
                    .then(res => res.json())
                    .then(
                        result => {
                            jobTpl.title = result.title;
                            jobTpl.skills = result.skills;
                            jobTpl.description = result.description;
                            jobTpl.currency = result.currency;
                            jobTpl.budget = result.budget;
                            this.BidCreatedInit(jobTpl);
                        },
                        error => {
                            console.log(error);
                            jobTpl.err = 'Can not fetch data from server';
                            this.BidCreatedInit(jobTpl);
                        }
                    );
            }
        }
    };

    BidCreatedInit = job => {
        const { web3 } = this.props;
        abiConfig.getPastEventsMerge(web3, 'BBFreelancerBid', 'BidCreated', { jobHash: web3.sha3(job.jobHash) }, job, this.BidAcceptedInit);
    };

    BidAcceptedInit = jobData => {
        const { web3 } = this.props;
        abiConfig.getPastEventsBidAccepted(
            web3,
            'BBFreelancerBid',
            'BidAccepted',
            { jobHash: web3.sha3(jobData.data.jobHash) },
            jobData.data,
            this.JobsInit
        );
    };

    JobsInit = jobData => {
        jobs.push(jobData.data);
        if (this.mounted) {
            this.setState({ Jobs: jobs, isLoading: false });
        }
    };

    jobsRender() {
        const { Jobs } = this.state;
        const filteredJobs = Jobs.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS));
        return (
            <Grid container className="job-item-list">
                {filteredJobs &&
                    filteredJobs.map(job => {
                        return (
                            <Link to={'freelancer/jobs/' + job.jobHash} key={job.id} className="job-item">
                                <Grid item xs={12}>
                                    <Grid container className="header">
                                        <Grid item xs={9} className="title">
                                            {job.title}
                                        </Grid>
                                        <Grid item xs={3} className="budget">
                                            <span className="bold">
                                                {job.budget.max_sum}
                                                {' ( ' + job.currency.label + ' ) '}
                                            </span>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12} className="content">
                                        <Grid item xs={12} className="description">
                                            {job.description}
                                        </Grid>
                                        <Grid item xs={12} className="status">
                                            <span className="status green bold">{Utils.getStatusJob(job.status)}</span>
                                            <span>
                                                {' - ' + job.bid.length + ' '}
                                                bids
                                            </span>
                                        </Grid>
                                        <Grid item xs={12} className="category">
                                            <span className="bold">Skill Required: </span>
                                            {job.skills.map((skill, key) => {
                                                return (
                                                    <span className="tag" key={key}>
                                                        {skill.label}
                                                    </span>
                                                );
                                            })}
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Link>
                        );
                    })}
            </Grid>
        );
    }

    jobsFilterByCategory(filterData) {
        let jobsFilter = [];
        if (filterData) {
            if (filterData.length > 0) {
                for (let category of filterData) {
                    const jobsFilterSelected = jobs.filter(job => job.category === category.value);
                    jobsFilter = [...jobsFilter, ...jobsFilterSelected];
                    this.setState({ Jobs: jobsFilter });
                }
            } else {
                this.setState({ Jobs: jobs });
            }
        }
    }

    progress = () => {
        const { completed } = this.state;
        if (completed >= 100) {
            if (this.mounted) {
                this.getJobs();
            }
        } else {
            this.setState({ completed: completed >= 100 ? 0 : completed + 100 / (60 * 2) }); // each 2 minutes that reload data
        }
    };

    searchUpdated(term) {
        this.setState({ searchTerm: term });
    }

    handleClickListItem = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleMenuItemClick = (event, index) => {
        this.setState({ selectedIndex: index, anchorEl: null });
    };

    handleClose = () => {
        this.setState({ anchorEl: null });
    };

    handleChangeCategory = selectedOption => {
        this.setState({ selectedCategory: selectedOption });
        this.jobsFilterByCategory(selectedOption);
    };

    render() {
        const { selectedCategory, anchorEl, isLoading, stt } = this.state;
        const categories = settingsApi.getCategories();

        return (
            <div id="freelancer" className="container-wrp">
                <div className="container-wrp full-top-wrp">
                    <div className="container wrapper">
                        <Grid container className="main-intro">
                            <h1>Find any job you can do</h1>
                            <span className="description">Use filter tool to find all job that fit to you.</span>
                        </Grid>
                    </div>
                </div>
                <div className="container-wrp main-ct">
                    <div className="container wrapper">
                        <Grid className="top-actions">
                            <div className="action timerReload">
                                <CircularProgress variant="static" value={this.state.completed} />
                            </div>

                            <Grid className="action">
                                <ButtonBase className="btn btn-normal btn-green" onClick={this.getJobs}>
                                    <FontAwesomeIcon icon="sync-alt" />
                                    Refresh
                                </ButtonBase>
                            </Grid>
                        </Grid>
                        <Grid container className="single-body">
                            <Grid container className="filter">
                                <Grid item xs={5}>
                                    <SearchInput
                                        className="search-input"
                                        placeholder="Enter wallet address or anything..."
                                        onChange={e => this.searchUpdated(e)}
                                    />
                                </Grid>
                                <Grid item xs={5}>
                                    <Select
                                        value={selectedCategory}
                                        onChange={this.handleChangeCategory}
                                        options={categories}
                                        isMulti
                                        placeholder="Select category..."
                                    />
                                </Grid>
                                <Grid item xs={2} className="sort">
                                    <List component="nav">
                                        <ListItem
                                            className="select-item"
                                            button
                                            aria-haspopup="true"
                                            aria-controls="lock-menu"
                                            aria-label="Sort by"
                                            onClick={this.handleClickListItem}
                                        >
                                            <ListItemText
                                                className="select-item-text"
                                                primary="Sort by"
                                                secondary={options[this.state.selectedIndex]}
                                            />
                                            <FontAwesomeIcon className="icon" icon="angle-down" />
                                        </ListItem>
                                    </List>
                                    <Menu id="lock-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleClose}>
                                        {options.map((option, index) => (
                                            <MenuItem
                                                key={option}
                                                selected={index === this.state.selectedIndex}
                                                onClick={event => this.handleMenuItemClick(event, index)}
                                            >
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </Grid>
                            </Grid>
                            {!isLoading ? (
                                !stt.err ? (
                                    this.jobsRender()
                                ) : (
                                    <div className="no-data">{stt.text}</div>
                                )
                            ) : (
                                <div className="loading">
                                    <CircularProgress size={50} color="secondary" />
                                    <span>Loading...</span>
                                </div>
                            )}
                        </Grid>
                    </div>
                </div>
            </div>
        );
    }
}

JobBrowser.propTypes = {
    web3: PropTypes.object.isRequired,
    isConnected: PropTypes.bool.isRequired,
};
const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
        isConnected: state.homeReducer.isConnected,
    };
};

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(JobBrowser);
