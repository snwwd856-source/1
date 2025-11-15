export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "PromoHive - Global Promo Network";

export const APP_LOGO = "/promohive-logo.png";

// Redirect to login page
export const getLoginUrl = () => {
  return "/login";
};

// Redirect to register page
export const getRegisterUrl = () => {
  return "/register";
};
