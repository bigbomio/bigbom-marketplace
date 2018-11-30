import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';

import Utils from '../../_utils/utils';

class JobsRender extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Jobs: [],
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        if (nextProps.Jobs === prevState.Jobs) {
            return null;
        }
        return { Jobs: nextProps.Jobs };
    }

    render() {
        const { Jobs } = this.state;

        return (
            <Grid container className="job-item-list">
                {Jobs.length > 0 &&
                    Jobs.map((job, i) => {
                        const maxLength = 400; // max length characters show on description
                        const description = job.description.length > maxLength ? job.description.slice(0, maxLength) + '...' : job.description;
                        return (
                            <Link to={'freelancer/jobs/' + job.jobID} key={i} className="job-item">
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
}

const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(JobsRender);
