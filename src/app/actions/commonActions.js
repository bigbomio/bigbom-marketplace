import * as types from '../constants/actionTypes';

export const getRatingLogs = payload => ({
    type: types.GET_RATING_LOGS,
    payload,
});
