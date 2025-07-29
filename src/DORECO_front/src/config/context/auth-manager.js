import Cookies from "js-cookie"

export const AuthManager = {
  setAuthData: (token, userData) => {
    Cookies.set("auth_token", token, {
      expires: 7,
      secure: import.meta.env.PROD,
      sameSite: "strict",
    })

    localStorage.setItem("user_data", JSON.stringify(userData))
  },

  getToken: () => {
    return Cookies.get("auth_token") || localStorage.getItem("auth_token")
  },

  getUserData: () => {
    const userData = localStorage.getItem("user_data")
    return userData ? JSON.parse(userData) : null
  },

  isAuthenticated: () => {
    const token = AuthManager.getToken()
    const userData = AuthManager.getUserData()
    return !!(token && userData)
  },

  clearAuthData: () => {
    Cookies.remove("auth_token")
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
  },

  updateUserData: (newUserData) => {
    const currentData = AuthManager.getUserData()
    const updatedData = { ...currentData, ...newUserData }
    localStorage.setItem("user_data", JSON.stringify(updatedData))
    return updatedData
  },
}
