import { put, call, all } from 'redux-saga/effects';
import services from '../_services/services';
import * as types from '../constants/actionTypes';

export default function* ExchangeRatesSaga() {
    try {
        const rates = yield call(services.getRates);
        yield all([put({ type: types.GET_EXCHANGE_RATES_SUCCESS, rates })]);
    } catch (error) {
        yield put({ type: types.GET_EXCHANGE_RATES_ERROR, error });
    }
}
