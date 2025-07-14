"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import { AuthManager } from "./auth-manager"
import axiosClient from "@config/http-client/axios-client"
import Swal from "sweetalert2"

const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload }

    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
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

      // Simular usuarios del sistema
      const mockUsers = [
        {
          id: 1,
          email: "admin@doreco.com",
          password: "admin123",
          name: "María González",
          role: "admin",
          phone: "+52 55 1234 5678",
          location: "Ciudad de México, CDMX",
          bio: "Administradora del sistema DORECO",
          avatar: "/placeholder.svg?height=100&width=100",
          joinedAt: "2023-01-15",
          stats: {
            objectsPublished: 25,
            reservationsMade: 12,
            totalViews: 1247,
          },
        },
        {
          id: 2,
          email: "estudiante@doreco.com",
          password: "estudiante123",
          name: "Carlos Rodríguez",
          role: "user",
          phone: "+52 55 9876 5432",
          location: "Guadalajara, JAL",
          bio: "Estudiante de Ingeniería en Sistemas, me gusta reutilizar objetos y ayudar al medio ambiente",
          avatar: "/placeholder.svg?height=100&width=100",
          joinedAt: "2023-03-20",
          stats: {
            objectsPublished: 8,
            reservationsMade: 15,
            totalViews: 342,
          },
          interests: [1, 3, 7, 9], // IDs de objetos de interés
        },
      ]

      // Buscar usuario
      const user = mockUsers.find((u) => u.email === credentials.email && u.password === credentials.password)

      if (!user) {
        throw new Error("Credenciales inválidas")
      }

      const token = `mock_token_${user.id}_${Date.now()}`

      // Guardar datos de autenticación
      AuthManager.setAuthData(token, user)

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token },
      })

      // Mostrar alerta de éxito
      Swal.fire({
        icon: "success",
        title: "¡Bienvenido!",
        text: `Hola ${user.name}, has iniciado sesión como ${user.role === "admin" ? "Administrador" : "Estudiante"}.`,
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: "rounded-2xl",
        },
      })

      return { success: true, user, token }
    } catch (error) {
      const errorMessage = error.message || "Error al iniciar sesión"

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

/*
Este es el login que se usara una vez que se conecte el back y front el de arriba es solo de prueba
  const login = async (credentials) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })

      const response = await axiosClient.post("/auth/login", credentials)
      const { token, user } = response.data

      AuthManager.setAuthData(token, user)

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token },
      })

      Swal.fire({
        icon: "success",
        title: "¡Bienvenido!",
        text: `Hola ${user.name || user.email}, has iniciado sesión correctamente.`,
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: "rounded-2xl",
        },
      })

      return { success: true, user, token }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error al iniciar sesión"

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
*/
  const register = async (userData) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "CLEAR_ERROR" })

      const response = await axiosClient.post("/auth/register", userData)
      const { token, user } = response.data

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

      return { success: true, user, token }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error al registrar usuario"

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
