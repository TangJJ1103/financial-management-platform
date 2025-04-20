const isLogin = () => {
  return sessionStorage.getItem("user") !== null;
};

export default isLogin;
