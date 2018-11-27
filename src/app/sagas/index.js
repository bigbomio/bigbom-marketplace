import { all, fork } from 'redux-saga/effects';
import { watchGetRatingLogs } from './watcher';

export default function* rootSaga() {
    yield all([fork(watchGetRatingLogs)]);
}
