import initialState from './initialState';
import * as types from '../constants/actionTypes';

// Handles post related actions
export default function(state = initialState.ratingDatas, action) {
    switch (action.type) {
        case types.GET_RATING_LOGS_SUCCESS:
            return { ...state, ratingDatas: action.ratingDatas };
        default:
            return state;
    }
}
