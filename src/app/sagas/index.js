import { all, fork } from 'redux-saga/effects';
import { watchGetRatingLogs, watchGetExchangeRates } from './watcher';

export default function* rootSaga() {
    yield all([fork(watchGetRatingLogs), fork(watchGetExchangeRates)]);
}
