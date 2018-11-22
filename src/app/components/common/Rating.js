import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import ButtonBase from '@material-ui/core/ButtonBase';
import StarRatingComponent from 'react-star-rating-component';

class Rating extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { avgRating } = this.props;
        const charts = [
            { index: 5, width: '100%', amount: 1405 },
            { index: 4, width: '80%', amount: 1405 },
            { index: 3, width: '30%', amount: 1405 },
            { index: 2, width: '20%', amount: 1405 },
            { index: 1, width: '10%', amount: 1405 },
        ];
        return (
            <div className="rating">
                <span className="avg">{avgRating}</span>
                <StarRatingComponent
                    name="main"
                    starColor="#ffb400"
                    emptyStarColor="#ffb400"
                    value={avgRating}
                    editing={false}
                    renderStarIcon={(index, value) => {
                        return (
                            <span>
                                <i className={index <= value ? 'fas fa-star' : 'far fa-star'} />
                            </span>
                        );
                    }}
                    renderStarIconHalf={() => {
                        return (
                            <span>
                                <span style={{ position: 'absolute' }}>
                                    <i className="far fa-star" />
                                </span>
                                <span>
                                    <i className="fas fa-star-half" />
                                </span>
                            </span>
                        );
                    }}
                />
                <span className="total">302 Reviews</span>

                <div className="rating-detail">
                    <span className="close">
                        <i className="fas fa-window-close" />
                    </span>
                    <div className="left">
                        <div className="avg-detail">{avgRating}</div>
                        <div className="star">
                            <StarRatingComponent
                                name="detail"
                                starColor="#ffb400"
                                emptyStarColor="#ffb400"
                                value={avgRating}
                                editing={false}
                                renderStarIcon={(index, value) => {
                                    return (
                                        <span>
                                            <i className={index <= value ? 'fas fa-star' : 'far fa-star'} />
                                        </span>
                                    );
                                }}
                                renderStarIconHalf={() => {
                                    return (
                                        <span>
                                            <span style={{ position: 'absolute' }}>
                                                <i className="far fa-star" />
                                            </span>
                                            <span>
                                                <i className="fas fa-star-half" />
                                            </span>
                                        </span>
                                    );
                                }}
                            />
                        </div>
                        <div className="total">302 Reviews</div>
                        <ButtonBase>Write a Review</ButtonBase>
                    </div>
                    <div className="right">
                        {charts.map(chart => {
                            return (
                                <div className="row" title={chart.amount + ' reviews'} key={chart.index}>
                                    <div className="numRate">{chart.index}</div>
                                    <div className="chart">
                                        <div className={'widthRate widthRate-' + chart.index} style={{ width: chart.width }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="rating-submit" />
                </div>
            </div>
        );
    }
}

Rating.propTypes = {
    avgRating: PropTypes.number.isRequired,
};

Rating.defaultProps = {};

const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = {};

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(Rating)
);
