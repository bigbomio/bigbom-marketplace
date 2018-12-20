import { takeLatest } from 'redux-saga/effects';
import RatingSaga from './RatingSaga';
import ExchangeRatesSaga from './ExchangeRatesSaga';
import * as types from '../constants/actionTypes';

export function* watchGetRatingLogs() {
    yield takeLatest(types.GET_RATING_LOGS, RatingSaga);
}

export function* watchGetExchangeRates() {
    yield takeLatest(types.GET_EXCHANGE_RATES, ExchangeRatesSaga);
}
