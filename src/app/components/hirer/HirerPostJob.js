import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Select from 'react-select';
import ButtonBase from '@material-ui/core/ButtonBase';

const skillsRequired = [
    { value: 'chocolate', label: 'CSS' },
    { value: 'strawberry', label: 'HTML' },
    { value: 'vanilla', label: 'SEO' },
];
const currencies = [
    { value: 'chocolate', label: 'USD' },
    { value: 'strawberry', label: 'VND' },
    { value: 'vanilla', label: 'JPY' },
];

const budgets = [
    {
        value: 'chocolate1',
        id: '193',
        min_sum: '12',
        max_sum: '30',
        label: 'Micro Project',
        currency: '6',
        budget_period: 'fixed',
    },
    {
        value: 'chocolate2',
        id: '31',
        min_sum: '30',
        max_sum: '250',
        label: 'Simple project',
        currency: '6',
        budget_period: 'fixed',
    },
    {
        value: 'chocolate3',
        id: '32',
        min_sum: '250',
        max_sum: '750',
        label: 'Very small project',
        currency: '6',
        budget_period: 'fixed',
        selected: true,
    },
    {
        value: 'chocolat4',
        id: '33',
        min_sum: '750',
        max_sum: '1500',
        label: 'Small project',
        currency: '6',
        budget_period: 'fixed',
    },
    {
        value: 'chocolate5',
        id: '34',
        min_sum: '1500',
        max_sum: '3000',
        label: 'Medium project',
        currency: '6',
        budget_period: 'fixed',
    },
    {
        value: 'chocolate6',
        id: '35',
        min_sum: '3000',
        max_sum: '5000',
        label: 'Large project',
        currency: '6',
        budget_period: 'fixed',
    },
    {
        value: 'chocolate7',
        id: '36',
        min_sum: '5000',
        max_sum: '10000',
        label: 'Larger project',
        currency: '6',
        budget_period: 'fixed',
    },
    {
        value: 'chocolate8',
        id: '234',
        min_sum: '10000',
        max_sum: '20000',
        label: 'Very Large project',
        currency: '6',
        budget_period: 'fixed',
    },
    {
        value: 'chocolate9',
        id: '253',
        min_sum: '20000',
        max_sum: '50000',
        label: 'Huge project',
        currency: '6',
        budget_period: 'fixed',
    },
    {
        value: 'chocolate10',
        id: '272',
        min_sum: '50000',
        max_sum: null,
        label: 'Major project',
        currency: '6',
        budget_period: 'fixed',
    },
];

class HirerPostJob extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedSkill: null,
        };
    }
    handleChangeSkills = selectedOption => {
        this.setState({ selectedSkill: selectedOption });
    };
    handleChangeCurrency = selectedOption => {
        this.setState({ selectedCurrency: selectedOption });
    };
    handleChangeBudget = selectedOption => {
        this.setState({ selectedBudget: selectedOption });
    };
    render() {
        const { selectedSkill, selectedCurrency, selectedBudget } = this.state;
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
                                    options={skillsRequired}
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
