import * as listTypes from './consts';

export const selectReddit = reddit => {
    return {
        type: listTypes.SELECT_REDDIT,
        reddit
    };
};

export const invalidateReddit = reddit => {
    return {
        type: listTypes.INVALIDATE_REDDIT,
        reddit
    };
};

export const requestPosts = reddit => {
    return {
        type: listTypes.REQUEST_POSTS,
        reddit
    };
};

export const receivePosts = (reddit, posts) => {
    return {
        type: listTypes.RECEIVE_POSTS,
        reddit,
        posts,
        receivedAt: Date.now()
    };
};
