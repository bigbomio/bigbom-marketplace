import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Select from 'react-select';
import ButtonBase from '@material-ui/core/ButtonBase';

import settingsApi from '../../_services/settingsApi';

class HirerPostJob extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedSkill: null,
            selectedCurrency: 'USD',
            budgets: settingsApi.getBudgets(),
        };
    }
    handleChangeSkills = selectedOption => {
        this.setState({ selectedSkill: selectedOption });
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
    render() {
        const { selectedSkill, selectedCurrency, selectedBudget } = this.state;
        const categories = settingsApi.getCategories();
        const { budgets } = this.state;
        const currencies = settingsApi.getCurrencies();
        return (
            <div className="container-wrp">
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
                                <span className="mkp-form-row-description">From 10 to 60 characters</span>
                                <input type="text" />
                            </Grid>
                            <Grid item xs={12} className="mkp-form-row">
                                <span className="mkp-form-row-label">Job description</span>
                                <span className="mkp-form-row-description">
                                    Start with a bit about yourself or your business, and include an overview of what
                                    you need done.
                                </span>
                                <textarea rows="5" />
                            </Grid>
                            <Grid item xs={12} className="mkp-form-row">
                                <span className="mkp-form-row-label">What skills are required?</span>
                                <span className="mkp-form-row-description">
                                    Enter up to 5 skills that best describe your project. Freelancers will use these
                                    skills to find projects they are most interested and experienced in.
                                </span>
                                <Select
                                    value={selectedSkill}
                                    onChange={this.handleChangeSkills}
                                    options={categories}
                                    isMulti
                                />
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
                                <ButtonBase className="btn btn-normal btn-blue">Create Job</ButtonBase>
                            </Grid>
                        </Grid>
                    </div>
                </div>
            </div>
        );
    }
}

export default HirerPostJob;
