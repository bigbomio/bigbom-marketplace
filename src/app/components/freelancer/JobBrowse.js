import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import SearchInput, { createFilter } from 'react-search-input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import Utils from '../../_utils/utils';
import settingsApi from '../../_services/settingsApi';
import Jobs from '../../_services/jobData';

const options = ['Latest', 'Oldest', 'Lowest Budget', 'Highest Budget', 'Most Bids', 'Fewest Bids'];
const KEYS_TO_FILTERS = ['id', 'title'];

class JobBrowser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null,
            selectedIndex: 1,
            searchTerm: '',
        };
    }

    jobsRender() {
        const filteredJobs = Jobs.filter(createFilter(this.state.searchTerm, KEYS_TO_FILTERS));
        return (
            <Grid container className="job-item-list">
                {filteredJobs &&
                    filteredJobs.map(job => {
                        return (
                            <Link to={'freelancer/jobs/' + job.id} key={job.id} className="job-item">
                                <Grid item xs={12}>
                                    <Grid container className="header">
                                        <Grid item xs={9} className="title">
                                            {job.title}
                                        </Grid>
                                        <Grid item xs={3} className="budget">
                                            <span className="bold">
                                                {job.budget.min_sum} - {job.budget.max_sum}
                                                {' ( ' + job.currency + ' ) '}
                                            </span>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12} className="content">
                                        <Grid item xs={12} className="description">
                                            {job.description}
                                        </Grid>
                                        <Grid item xs={12} className="status">
                                            <span className="status green bold">
                                                {Utils.getStatusJobOpen(job.bid)
                                                    ? 'Bidding'
                                                    : Utils.getStatusJob(job.status)}
                                            </span>
                                            <span>
                                                {' - ' + job.bid.length + ' '}
                                                bids
                                            </span>
                                        </Grid>
                                        <Grid item xs={12} className="category">
                                            <span className="bold">Category: </span>
                                            {job.category.map((cate, key) => {
                                                return (
                                                    <span className="tag" key={key}>
                                                        {cate}
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
    };

    render() {
        const { selectedCategory, anchorEl } = this.state;
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
                        <Grid container className="single-body">
                            <Grid container className="filter">
                                <Grid item xs={5}>
                                    <SearchInput className="search-input" onChange={e => this.searchUpdated(e)} />
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
                                    <Menu
                                        id="lock-menu"
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={this.handleClose}
                                    >
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
                            {this.jobsRender()}
                        </Grid>
                    </div>
                </div>
            </div>
        );
    }
}

export default JobBrowser;
