export const LoginReducer = (state, action) => {
  const { type, payload } = action;

  switch (type) {
    case 'AUTH_LOADING':
      return {
        ...state,
        isLoading: true,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: payload.user,
      };

    case 'LOGOUT':
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      };

    default:
      return state;
  }
};