import { takeLatest } from 'redux-saga/effects';
import RatingSaga from './RatingSaga';
import * as types from '../constants/actionTypes';

export function* watchGetRatingLogs() {
    yield takeLatest(types.GET_RATING_LOGS, RatingSaga);
}
