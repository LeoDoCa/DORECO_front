import axios from "axios"
import Cookies from "js-cookie"
import Swal from "sweetalert2"

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

axiosClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("auth_token") || localStorage.getItem("auth_token")

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

axiosClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const { response } = error
    if (!response) {
      Swal.fire({
        icon: "error",
        title: "Error de Conexión",
        text: "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
        confirmButtonText: "Entendido",
        customClass: {
          popup: "rounded-2xl",
          confirmButton: "btn-primary",
        },
      })
      return Promise.reject(error)
    }

    switch (response.status) {
      case 401:
        Cookies.remove("auth_token")
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_data")

        Swal.fire({
          icon: "warning",
          title: "Sesión Expirada",
          text: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
          confirmButtonText: "Ir al Login",
          customClass: {
            popup: "rounded-2xl",
            confirmButton: "btn-primary",
          },
        }).then(() => {
          window.location.href = "/login"
        })
        break

      case 403:
        Swal.fire({
          icon: "error",
          title: "Acceso Denegado",
          text: "No tienes permisos para realizar esta acción.",
          confirmButtonText: "Entendido",
          customClass: {
            popup: "rounded-2xl",
            confirmButton: "btn-primary",
          },
        })
        break

      case 404:
        Swal.fire({
          icon: "error",
          title: "Recurso No Encontrado",
          text: "El recurso solicitado no existe o ha sido eliminado.",
          confirmButtonText: "Entendido",
          customClass: {
            popup: "rounded-2xl",
            confirmButton: "btn-primary",
          },
        })
        break

      case 422:
        // Errores de validación - se manejan en el componente
        break

      case 500:
        Swal.fire({
          icon: "error",
          title: "Error del Servidor",
          text: "Ha ocurrido un error interno. Por favor, intenta más tarde.",
          confirmButtonText: "Entendido",
          customClass: {
            popup: "rounded-2xl",
            confirmButton: "btn-primary",
          },
        })
        break

      default:
        Swal.fire({
          icon: "error",
          title: "Error Inesperado",
          text: response.data?.message || "Ha ocurrido un error inesperado.",
          confirmButtonText: "Entendido",
          customClass: {
            popup: "rounded-2xl",
            confirmButton: "btn-primary",
          },
        })
    }

    return Promise.reject(error)
  },
)

export default axiosClient
