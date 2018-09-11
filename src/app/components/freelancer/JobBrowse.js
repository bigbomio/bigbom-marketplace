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
import CircleProgress from '../common/circleProgress';

import { saveJobs } from '../hirer/actions';

let jobs = [];

const options = ['Latest', 'Oldest', 'Highest Budget', 'Lowest Budget', 'Most Bids', 'Fewest Bids'];
const KEYS_TO_FILTERS = ['owner', 'title', 'description'];

class JobBrowser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null,
            selectedIndex: 0,
            searchTerm: '',
            isLoading: false,
            Jobs: [],
            stt: { err: false, text: null },
            circleProgressRender: false,
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
            }
        }
    }

    componentDidUpdate() {}

    componentWillUnmount() {
        this.mounted = false;
    }

    getJobs = () => {
        const { web3 } = this.props;
        this.setState({ isLoading: true, Jobs: [], circleProgressRender: false });
        jobs = [];
        abiConfig.getPastSingleEvent(web3, 'BBFreelancerJob', 'JobCreated', {}, this.JobCreatedInit);
    };

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
            const jobStatus = Utils.getStatus(jobStatusLog);
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
                    blockNumber: event.blockNumber,
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
                            jobTpl.estimatedTime = result.estimatedTime;
                            jobTpl.expiredTime = result.expiredTime;
                            jobTpl.created = result.created;
                            this.BidCreatedInit(jobTpl);
                        },
                        error => {
                            console.log(error);
                            jobTpl.err = 'Can not fetch data from server';
                            // this.BidCreatedInit(jobTpl); // dont push if data can not fetch
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
        const { selectedIndex } = this.state;
        const { saveJobs } = this.props;
        jobs.push(jobData.data);
        const uqJobs = Utils.removeDuplicates(jobs, 'id'); // fix duplicate data
        this.handleMenuItemSort(null, selectedIndex, jobs);
        if (this.mounted) {
            saveJobs(uqJobs);
            this.setState({ Jobs: uqJobs, isLoading: false, circleProgressRender: true });
        }
    };

    jobsRender() {
        const { Jobs } = this.state;
        const filteredJobs = Jobs.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS));
        //console.log(jobs);
        return (
            <Grid container className="job-item-list">
                {filteredJobs &&
                    filteredJobs.map((job, i) => {
                        const maxLength = 400; // max length characters show on description
                        const description = job.description.length > maxLength ? job.description.slice(0, maxLength) + '...' : job.description;
                        return (
                            <Link to={'freelancer/jobs/' + job.jobHash} key={i} className="job-item">
                                <Grid item xs={12}>
                                    <Grid container className="header">
                                        <Grid item xs={9} className="title">
                                            {job.title}
                                        </Grid>
                                        <Grid item xs={3} className="budget">
                                            <span className="bold">
                                                {Utils.currencyFormat(job.budget.max_sum)}
                                                {' ( ' + job.currency.label + ' ) '}
                                            </span>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12} className="content">
                                        <Grid item xs={12} className="description">
                                            {description}
                                        </Grid>
                                        <Grid item xs={12} className="status">
                                            <span className="status green bold">{Utils.getStatusJob(job.status)}</span>
                                            <span className="status stt-date-time">{' - Created: ' + Utils.convertDateTime(job.created)}</span>
                                            <span className="bold">{' - ' + job.bid.length + ' '}</span>
                                            bids
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

    searchUpdated(term) {
        this.setState({ searchTerm: term });
    }

    handleClickListItemSort = event => {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleMenuItemSort = (event, index, Jobs) => {
        this.setState({ selectedIndex: index, anchorEl: null });
        //onst { Jobs } = this.state;
        switch (index) {
            case 0:
                //Latest
                Jobs.sort((a, b) => {
                    return b.created - a.created;
                });
                break;
            case 1:
                // Oldest
                Jobs.sort((a, b) => {
                    return a.created - b.created;
                });
                break;
            case 2:
                // Highest Budget
                Jobs.sort((a, b) => {
                    return b.budget.max_sum - a.budget.max_sum;
                });
                break;
            case 3:
                // Lowest Budget
                Jobs.sort((a, b) => {
                    return a.budget.max_sum - b.budget.max_sum;
                });
                break;
            case 4:
                // Most Bids
                Jobs.sort((a, b) => {
                    return b.bid.length - a.bid.length;
                });
                break;
            case 5:
                // Fewest Bids
                Jobs.sort((a, b) => {
                    return a.bid.length - b.bid.length;
                });
                break;
            default:
                // Latest
                Jobs.sort((a, b) => {
                    return b.created - a.created;
                });
        }
    };

    handleClose = () => {
        this.setState({ anchorEl: null });
    };

    handleChangeCategory = selectedOption => {
        this.setState({ selectedCategory: selectedOption });
        this.jobsFilterByCategory(selectedOption);
    };

    render() {
        const { selectedCategory, anchorEl, isLoading, stt, circleProgressRender, Jobs } = this.state;
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
                            <div className="action timerReload">{circleProgressRender && <CircleProgress callback={this.getJobs} />}</div>
                            <Grid className="action reload-btn">
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
                                            onClick={this.handleClickListItemSort}
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
                                                onClick={event => this.handleMenuItemSort(event, index, Jobs)}
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
    saveJobs: PropTypes.func.isRequired,
};
const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
        isConnected: state.homeReducer.isConnected,
    };
};

const mapDispatchToProps = { saveJobs };

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(JobBrowser);
