import { handleActions, createActions } from 'redux-actions';
import { Map } from 'immutable';

export const { updateAgentListAction } = createActions({
  updateAgentListAction: action => {
    return action;
  }
});

const initState = Map({
  data: []
});

const convs = handleActions(
  {
    [updateAgentListAction]: (state, action) => {
      const data = action.payload(state.get('agentList'));
      return state.set('agentList', data);
    }
  },
  initState
);

export default convs;
