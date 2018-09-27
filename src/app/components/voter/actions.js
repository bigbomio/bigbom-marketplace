import * as listTypes from './consts';

export const saveDisputes = disputes => {
    return {
        type: listTypes.SAVE_DISPUTES,
        disputes,
    };
};
