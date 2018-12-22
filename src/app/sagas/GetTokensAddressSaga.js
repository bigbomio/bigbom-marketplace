import { put, call, all } from 'redux-saga/effects';
import * as types from '../constants/actionTypes';
import contractApis from '../_services/contractApis';

export default function* GetTokensAddressSaga() {
    try {
        const tokensAddress = yield call(contractApis.getTokenAddress);
        yield all([put({ type: types.GET_TOKENS_ADDRESS_SUCCESS, tokensAddress })]);
    } catch (error) {
        yield put({ type: types.GET_TOKENS_ADDRESS_ERROR, error });
    }
}
