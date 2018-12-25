import { put, call, all } from 'redux-saga/effects';
import contracApis from '../_services/contractApis';
import * as types from '../constants/actionTypes';

export default function* RatingSaga({ payload }) {
    try {
        const ratingDatas = yield call(contracApis.getRatingLog, payload);
        yield all([put({ type: types.GET_RATING_LOGS_SUCCESS, ratingDatas: ratingDatas })]);
    } catch (error) {
        yield put({ type: 'GET_RATING_LOGS_ERROR', error });
    }
}
