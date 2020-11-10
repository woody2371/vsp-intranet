import {
  DIALOG,
  SNACKBAR,
  SNACKBAR_VARIANTS,
  SNACKBAR_SEVERITY
} from '../../utils/constants';
import {
  SET_AUTH_USER,
  LOGOUT,
  SET_MESSAGE,
  SET_AUTH_TOUCHED
} from '../../utils/actions';
import AuthUser from '../../models/auth-user';
import Message from '../../models/message';
import { unsubscribeNotificationsListener } from './notification';
import { unsubscribeUsersListener } from '../../store/actions/user';
let authUserListener;

export const verifyAuth = () => {
  return async (dispatch, getState) => {
    AuthUser.getAuth().onAuthStateChanged(async (firebaseAuthUser) => {
      if (firebaseAuthUser) {
        authUserListener = AuthUser.getAuthListener(
          firebaseAuthUser.uid
        ).onSnapshot(async (snapshot) => {
          const idTokenResult = await firebaseAuthUser.getIdTokenResult();
          const authUser = new AuthUser({
            ...snapshot.data(),
            userId: snapshot.id,
            admin: !!idTokenResult.claims.admin
          });
          const actions = [
            {
              type: SET_AUTH_USER,
              authUser
            }
          ];
          if (!getState().authState.touched) {
            const message = new Message({
              title: 'Login Success',
              body: `Welcome back ${authUser.firstName}`,
              feedback: SNACKBAR,
              options: {
                duration: 5000,
                variant: SNACKBAR_VARIANTS.FILLED,
                severity: SNACKBAR_SEVERITY.INFO
              }
            });
            actions.push(
              {
                type: SET_AUTH_TOUCHED
              },
              {
                type: SET_MESSAGE,
                message
              }
            );
          }
          dispatch(actions);
        });
      } else {
        dispatch({ type: SET_AUTH_TOUCHED });
      }
    });
  };
};

export const unsubscribeAuthUserListener = () => {
  if (authUserListener) {
    authUserListener();
  }
};

export const logout = () => {
  return async (dispatch, getState) => {
    const { authUser } = getState().authState;
    unsubscribeAuthUserListener();
    unsubscribeNotificationsListener();
    unsubscribeUsersListener();
    await authUser.logout();
    dispatch({ type: LOGOUT });
  };
};

export const logoutAll = () => {
  return async (dispatch, getState) => {
    const { authUser } = getState().authState;
    await authUser.logoutAll();
    dispatch({ type: LOGOUT });
  };
};

export const getPhoneNumber = (email) => {
  return async (dispatch, _getState) => {
    try {
      return AuthUser.getPhoneNumber(email);
    } catch (error) {
      const message = new Message({
        title: 'Invalid Credentials',
        body: 'Email address is invalid',
        feedback: DIALOG
      });
      dispatch({
        type: SET_MESSAGE,
        message
      });
      return false;
    }
  };
};

export const signInWithPhoneNumber = (phoneNumber, appVerifier) => {
  return async (dispatch, _getState) => {
    try {
      return AuthUser.signInWithPhoneNumber(phoneNumber, appVerifier);
    } catch (error) {
      const message = new Message({
        title: 'Invalid Credentials',
        body: 'Email address is invalid',
        feedback: DIALOG
      });
      dispatch({
        type: SET_MESSAGE,
        message
      });
      return false;
    }
  };
};

export const confirmVerificationCode = (
  confirmationResult,
  verificationCode
) => {
  return async (dispatch, _getState) => {
    try {
      await AuthUser.confirmVerificationCode(
        confirmationResult,
        verificationCode
      );
      return true;
    } catch (error) {
      const message = new Message({
        title: 'Invalid Credentials',
        body: 'Verification code is invalid',
        feedback: DIALOG
      });
      dispatch({
        type: SET_MESSAGE,
        message
      });
      return false;
    }
  };
};

export const loginWithPassword = (email, password) => {
  return async (dispatch, _getState) => {
    try {
      await AuthUser.signInWithEmailAndPassword(email, password);
      return true;
    } catch (error) {
      const message = new Message({
        title: 'Invalid Credentials',
        body: 'Incorrect email or password',
        feedback: DIALOG
      });
      dispatch({
        type: SET_MESSAGE,
        message
      });
      return false;
    }
  };
};

export const updateSettings = (settings) => {
  return async (dispatch, getState) => {
    try {
      const { authUser } = getState().authState;
      const newAuthUser = new AuthUser({ ...authUser, settings });
      await newAuthUser.save();
      return true;
    } catch (error) {
      const message = new Message({
        title: 'Update Settings',
        body: 'Settings failed to update',
        feedback: DIALOG
      });
      dispatch({
        type: SET_MESSAGE,
        message
      });
      return false;
    }
  };
};

export const uploadPicture = (file) => {
  return async (dispatch, getState) => {
    try {
      const { authUser } = getState().authState;
      const newAuthUser = new AuthUser({
        ...authUser
      });
      await newAuthUser.uploadProfilePicture(file);
      return true;
    } catch (error) {
      const message = new Message({
        title: 'Profile Picture',
        body: 'Profile picture failed to upload',
        feedback: DIALOG
      });
      dispatch({
        type: SET_MESSAGE,
        message
      });
      return false;
    }
  };
};

export const removePicture = () => {
  return async (dispatch, getState) => {
    try {
      const { authUser } = getState().authState;
      const newAuthUser = new AuthUser({
        ...authUser
      });
      await newAuthUser.removeProfilePicture();
      return true;
    } catch (error) {
      const message = new Message({
        title: 'Profile Picture',
        body: 'Profile picture failed to remove',
        feedback: DIALOG
      });
      dispatch({
        type: SET_MESSAGE,
        message
      });
      return false;
    }
  };
};
