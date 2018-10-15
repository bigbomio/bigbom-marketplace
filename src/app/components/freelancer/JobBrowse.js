import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Grid from '@material-ui/core/Grid';
import Select from 'react-select';
import ButtonBase from '@material-ui/core/ButtonBase';
import CircularProgress from '@material-ui/core/CircularProgress';
import SearchInput, { createFilter } from 'react-search-input';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import Utils from '../../_utils/utils';
import settingsApi from '../../_services/settingsApi';
import abiConfig from '../../_services/abiConfig';

import JobsRender from './JobsRender';

import { saveJobs } from '../client/actions';

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
            stt: { err: false, text: null },
        };
        this.timer = null;
        this.mounted = false;
    }

    componentDidMount() {
        const { isConnected, web3 } = this.props;
        web3.eth.getBlockNumber((error, result) => {
            console.log(result); // 2744
        });

        const { isLoading } = this.state;
        if (isConnected) {
            if (!isLoading) {
                this.mounted = true;
                this.getJobs();
            }
        }
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    getJobs = () => {
        const { web3 } = this.props;
        this.setState({ isLoading: true });
        jobs = [];
        abiConfig.getPastSingleEvent(web3, 'BBFreelancerJob', 'JobCreated', {}, this.JobCreatedInit);
    };

    JobCreatedInit = async eventLog => {
        //console.log('getPastSingleEvent success: ', eventLog);
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
                    jobBlockNumber: event.blockNumber,
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
        //console.log('BidCreatedInit success: ', job);
        const { web3 } = this.props;
        abiConfig.getPastEventsMergeBidToJob(web3, 'BBFreelancerBid', 'BidCreated', { jobHash: web3.sha3(job.jobHash) }, job, this.BidAcceptedInit);
    };

    BidAcceptedInit = jobData => {
        //console.log('BidAcceptedInit success: ', jobData);
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
            this.setState({ isLoading: false });
        }
    };

    jobsFilterByCategory(filterData) {
        let jobsFilter = [];
        const { saveJobs } = this.props;
        if (filterData) {
            if (filterData.length > 0) {
                for (let category of filterData) {
                    const jobsFilterSelected = jobs.filter(job => job.category === category.value);
                    jobsFilter = [...jobsFilter, ...jobsFilterSelected];
                    saveJobs(jobsFilter);
                }
            } else {
                saveJobs(jobs);
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
        if (this.mounted) {
            this.setState({ selectedIndex: index, anchorEl: null });
        }
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
        const { selectedCategory, anchorEl, isLoading, stt } = this.state;
        const { jobs } = this.props;
        const filteredJobs = jobs.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS));
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
                            <Grid className="action reload-btn">
                                <ButtonBase className="btn btn-normal btn-green" onClick={this.getJobs}>
                                    <i className="fas fa-sync-alt" />
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
                                            <i className="fas fa-angle-down icon" />
                                        </ListItem>
                                    </List>
                                    <Menu id="lock-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={this.handleClose}>
                                        {options.map((option, index) => (
                                            <MenuItem
                                                key={option}
                                                selected={index === this.state.selectedIndex}
                                                onClick={event => this.handleMenuItemSort(event, index, jobs)}
                                            >
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </Grid>
                            </Grid>
                            {!isLoading ? (
                                !stt.err ? (
                                    <JobsRender Jobs={filteredJobs} />
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
    jobs: PropTypes.any.isRequired,
};
const mapStateToProps = state => {
    return {
        web3: state.homeReducer.web3,
        isConnected: state.homeReducer.isConnected,
        jobs: state.clientReducer.jobs,
    };
};

const mapDispatchToProps = { saveJobs };

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(JobBrowser);
