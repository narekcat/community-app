/**
 * Reducer for state.challenge
 */

import { handleActions } from 'redux-actions';
import challengeActions from 'actions/challenge';
import smpActions from 'actions/smp';

import { combine } from '../utils/redux';

import mySubmissionsManagement, { factory as mySMFactory } from './my-submissions-management';


/**
 * Creates a new Auth reducer with the specified initial state.
 * @param {Object} initialState Initial state.
 * @return Auth reducer.
 */
function create(initialState) {
  return handleActions({
    [challengeActions.fetchChallengeInit]: state => ({
      ...state,
      loadingDetails: true,
      details: null,
    }),

    [challengeActions.fetchChallengeDone]: (state, { payload }) => ({
      ...state,
      details: payload,
      loadingDetails: false,
    }),

    [challengeActions.fetchSubmissionsInit]: state => ({
      ...state,
      loadingMySubmissions: true,
      mySubmissions: { v2: null },
    }),

    [challengeActions.fetchSubmissionsDone]: (state, { payload }) => ({
      ...state,
      loadingMySubmissions: false,
      mySubmissions: { v2: payload },
    }),

    // TODO: remove this reducer once the deleteSubmission action
    // in 'shared/actions/challenge' was fixed
    [smpActions.smp.deleteSubmissionDone]: (state, { payload }) => ({
      ...state,
      mySubmissions: { v2: state.mySubmissions.v2.filter(subm => (
          subm.submissionId !== payload
        )) },
    }),
  }, initialState || {});
}

/**
 * Factory which creates a new reducer with its initial state tailored to the
 * ExpressJS HTTP request, if specified (for server-side rendering). If HTTP
 * request is not specified, it creates just the default reducer.
 * @param {Object} req Optional. ExpressJS HTTP request.
 * @return Promise which resolves to the new reducer.
 */
export function factory(req) {
  let state = {};
  if (req) {
    state = {
      details: null,
      loadingDetails: false,
      loadingMySubmissions: false,
      mySubmissions: {
        v2: null,
      },
    };
  }

  return mySMFactory(req)
    .then(res => Promise.resolve(
        combine(create(state), { mySubmissionsManagement: res }),
      ));
}

/* Default reducer with empty initial state. */
export default combine(create(), { mySubmissionsManagement });
