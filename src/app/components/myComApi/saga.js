import { put, take, call, fork, select } from 'redux-saga/effects';
import api from '../../_services/api';
import * as actionList from './actions';
import * as nameActList from './consts';
import { postsByRedditSelector } from './selectors';

const fetchPostsApi = reddit => {
    const path = `/r/${reddit}.json`;

    return api
        .fetch(path)
        .then(res => {
            return res.data.data.children.map(item => {
                return item.data;
            });
        })
        .catch(err => {
            put({
                type: 'ERROR',
                err,
            });
            // console.log('err: ', err)
        });
};

function* fetchPosts() {
    while (true) {
        const isOnline = navigator.onLine ? true : false;
        const { reddit } = yield take(nameActList.SELECT_REDDIT);

        let dataPosts = null;
        let getPostsFromState = yield select(postsByRedditSelector);
        getPostsFromState = getPostsFromState.getIn([reddit, 'items']);
        console.log('getPostsFromState 11: ', getPostsFromState);
        !isOnline && getPostsFromState
            ? (dataPosts = getPostsFromState)
            : (dataPosts = yield call(fetchPostsApi, reddit));

        yield put(actionList.receivePosts(reddit, dataPosts));
    }
}

function* invalidateReddit() {
    // const delay = ms => new Promise(res => setTimeout(res, ms));
    while (true) {
        const isOnline = navigator.onLine ? true : false;
        console.log('isOnline: ', isOnline);
        const { reddit } = yield take(nameActList.INVALIDATE_REDDIT);

        let dataPosts = null;
        let getPostsFromState = yield select(postsByRedditSelector);
        getPostsFromState = getPostsFromState.getIn([reddit, 'items']);
        console.log('getPostsFromState 22: ', getPostsFromState);
        !isOnline && getPostsFromState
            ? (dataPosts = getPostsFromState)
            : (dataPosts = yield call(fetchPostsApi, reddit));

        yield put(actionList.receivePosts(reddit, dataPosts));
    }
}

export default function* root() {
    yield fork(fetchPosts);
    yield fork(invalidateReddit);
}
