// export const selectedRedditSelector = state =>  state.rootReducer.selectedReddit;
// export const postsByRedditSelector = state => state.rootReducer.postsByReddit;

export const selectedRedditSelector = state => {
    console.log(state.reducerMyComApi);
    return state.reducerMyComApi.getIn(['selectedReddit']);
};
export const postsByRedditSelector = state => state.reducerMyComApi.getIn(['postsByReddit']);
