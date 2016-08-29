import * as constants from '../constants/activeModal';

export const initialState = null;

export default function activeModal(state = initialState, action) {
  switch (action.type) {
    case constants.SHOW:
      return Object.assign({}, { modal: action.modal }, action.opts);
    case constants.HIDE:
      return null;
    default: return state;
  }
}
