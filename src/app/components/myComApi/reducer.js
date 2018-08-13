// import { combineReducers } from 'redux';
import { fromJS } from 'immutable';
import { combineReducers } from 'redux-immutable';
import { SELECT_REDDIT, REQUEST_POSTS, RECEIVE_POSTS, INVALIDATE_REDDIT } from './consts';

// const initialState = fromJS({
//     isFetching: true,
//     items: [],
//     lastUpdated: null
// });

const selectedReddit = (state = 'reactjs', action) => {
    switch (action.type) {
        case SELECT_REDDIT:
            return action.reddit;
        default:
            return state;
    }
};

const postsByReddit = (state = fromJS({}), action) => {
    const key = action.reddit;
    switch (action.type) {
        case INVALIDATE_REDDIT:
        case REQUEST_POSTS:
            return state.setIn([key, 'isFetching'], true);
        case RECEIVE_POSTS:
            return state
                .setIn([key, 'isFetching'], false)
                .setIn([key, 'items'], action.posts)
                .setIn([key, 'lastUpdated'], action.receivedAt);
        default:
            return state;
    }
};

const rootReducer = combineReducers({
    postsByReddit,
    selectedReddit
});

export default rootReducer;
