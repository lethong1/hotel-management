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

    // Tách riêng LOGOUT và AUTH_ERROR để code rõ ràng hơn
    case 'LOGOUT':
    case 'AUTH_ERROR':
      // Reducer bây giờ CHỈ cập nhật state, không làm gì khác
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