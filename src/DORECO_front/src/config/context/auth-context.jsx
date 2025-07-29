import { createContext, useContext, useReducer, useEffect } from "react"
import { AuthManager } from "./auth-manager"
import axiosClient from "@config/http-client/axios-client"
import Swal from "sweetalert2"
import { ref } from "yup"

const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }

    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.access,
        refreshToken: action.payload.refresh,
        loading: false,
        error: null,
      }

    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      }

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      }

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      }

    case "UPDATE_USER":
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      }

    default:
      return state
  }
}

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null,
}

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = AuthManager.getToken()
        const userData = AuthManager.getUserData()

        if (token && userData) {
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: { user: userData, token },
          })
        } else {
          dispatch({ type: "SET_LOADING", payload: false })
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }

    initializeAuth()
  }, [])

  const login = async (credentials) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })

      const response = await axiosClient.post("/auth/login/", credentials)
      const { access, refresh, user } = response.data

      AuthManager.setAuthData(access, user)
      localStorage.setItem("refresh_token", refresh)
      localStorage.setItem("auth_token", access)

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token: access },
      })

      Swal.fire({
        icon: "success",
        title: "¡Bienvenido!",
        text: `Hola ${user.name}, has iniciado sesión como ${user.role_name === "ADMIN" ? "Administrador" : "Usuario"}.`,
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: "rounded-2xl",
        },
      })

      return { success: true, user, token: access }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Error al iniciar sesión"

      dispatch({
        type: "SET_ERROR",
        payload: errorMessage,
      })

      Swal.fire({
        icon: "error",
        title: "Error de Autenticación",
        text: errorMessage,
        confirmButtonText: "Intentar de nuevo",
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "btn-primary",
        },
      })

      return { success: false, error: errorMessage }
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })

      const payload = {
        name: userData.name,
        surnames: userData.surnames,
        email: userData.email,
        username: userData.username,
        password: userData.password,
        password_confirm: userData.password_confirm,
        phone_number: userData.phone_number,
      }
      const response = await axiosClient.post("/auth/register/", payload)
      // Si la respuesta es 201 y contiene los datos del usuario, mostrar éxito
      if (response.status === 201 && response.data && response.data.id) {
        Swal.fire({
          icon: "success",
          title: "¡Registro Exitoso!",
          text: `Bienvenido ${response.data.name}, tu cuenta ha sido creada correctamente.`,
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-2xl",
          },
        })
        dispatch({ type: "SET_LOADING", payload: false })
        return { success: true, user: response.data }
      }
      // Si la respuesta contiene token y user (caso anterior)
      const { token, user } = response.data
      if (token && user) {
        AuthManager.setAuthData(token, user)
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user, token },
        })
        Swal.fire({
          icon: "success",
          title: "¡Registro Exitoso!",
          text: `Bienvenido ${user.name}, tu cuenta ha sido creada correctamente.`,
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-2xl",
          },
        })
        dispatch({ type: "SET_LOADING", payload: false })
        return { success: true, user, token }
      }
      // Si no, error genérico
      throw new Error("Respuesta inesperada del servidor")
    } catch (error) {
      // Procesar errores de validación del backend
      const errorData = error.response?.data
      let errorMessage = "Error al registrar usuario"
      if (errorData) {
        if (typeof errorData === "string") {
          errorMessage = errorData
        } else if (typeof errorData === "object") {
          errorMessage = Object.values(errorData).flat().join(" | ")
        }
      }
      dispatch({
        type: "SET_ERROR",
        payload: errorMessage,
      })
      Swal.fire({
        icon: "error",
        title: "Error de Registro",
        text: errorMessage,
        confirmButtonText: "Intentar de nuevo",
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "btn-primary",
        },
      })
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      const result = await Swal.fire({
        icon: "question",
        title: "¿Cerrar Sesión?",
        text: "¿Estás seguro de que deseas cerrar tu sesión?",
        showCancelButton: true,
        confirmButtonText: "Sí, cerrar sesión",
        cancelButtonText: "Cancelar",
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "btn-primary",
          cancelButton: "btn-secondary",
        },
      })

      if (result.isConfirmed) {
        try {
          await axiosClient.post("/auth/logout")
        } catch (error) {
          console.warn("Server logout failed:", error)
        }

        AuthManager.clearAuthData()
        dispatch({ type: "LOGOUT" })

        Swal.fire({
          icon: "success",
          title: "Sesión Cerrada",
          text: "Has cerrado sesión correctamente.",
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-2xl",
          },
        })

        return true
      }

      return false
    } catch (error) {
      console.error("Logout error:", error)
      return false
    }
  }

  const updateUser = (newUserData) => {
    const updatedUser = AuthManager.updateUserData(newUserData)
    dispatch({
      type: "UPDATE_USER",
      payload: updatedUser,
    })
    return updatedUser
  }

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default AuthContext
