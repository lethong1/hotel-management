export const LoginReducer = (state, action) => {
    const { type, payload } = action;
  
    switch (type) {
      // Trường hợp bắt đầu kiểm tra token hoặc đăng nhập
      case 'AUTH_LOADING':
        return {
          ...state,
          isLoading: true,
        };
  
      // Trường hợp xác thực thành công
      case 'AUTH_SUCCESS':
        return {
          ...state,
          isLoading: false,
          isAuthenticated: true,
          user: payload.user,
        };
  
      // Trường hợp xác thực thất bại hoặc logout
      case 'AUTH_ERROR':
        // Xóa token khỏi localStorage khi xác thực thất bại
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
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