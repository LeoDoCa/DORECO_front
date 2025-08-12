import { useState, useCallback } from "react"
import axiosClient from "@config/http-client/axios-client"
import { useConfirmAction } from "./useConfirmAction"

export const useApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { showSuccess, showError } = useConfirmAction()
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const apiCall = useCallback(
    async (
      apiFunction,
      {
        showSuccessMessage = true,
        successMessage = "Acción realizada exitosamente",
        showErrorMessage = true,
        onSuccess,
        onError,
      } = {},
    ) => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiFunction()

        if (showSuccessMessage) {
          showSuccess(successMessage)
        }

        if (onSuccess) {
          onSuccess(response.data)
        }

        return { success: true, data: response.data }
      } catch (err) {
        const getErrorMessage = (errorData) => {
          // Primero intentar obtener errores de validación de Django REST Framework
          if (errorData?.non_field_errors && Array.isArray(errorData.non_field_errors)) {
            return errorData.non_field_errors[0];
          }
          // Luego intentar otros formatos comunes
          if (errorData?.detail) {
            return errorData.detail;
          }
          if (errorData?.message) {
            return errorData.message;
          }
          if (errorData?.error) {
            return errorData.error;
          }
          return "Ha ocurrido un error, intentalo más tarde";
        };

        const errorMessage = getErrorMessage(err.response?.data);
        setError(errorMessage)

        if (showErrorMessage) {
          showError(errorMessage)
        }

        if (onError) {
          onError(err)
        }

        return { success: false, error: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    [showSuccess, showError],
  )

  const get = useCallback(
    (url, config = {}) => {
      return apiCall(() => axiosClient.get(url, config))
    },
    [apiCall],
  )

  const getSilence = useCallback(
    (url, apiOptions = {}) => {
      return apiCall(() => axiosClient.get(url), {
        showSuccessMessage: false,
        showErrorMessage: false,
        ...apiOptions,
      });
    },
    [apiCall],
  );
  const post = useCallback(
    (url, data = {}, config = {}) => {
      return apiCall(() => axiosClient.post(url, data, config))
    },
    [apiCall],
  )

  const put = useCallback(
    (url, data = {}, config = {}) => {
      return apiCall(() => axiosClient.put(url, data, config))
    },
    [apiCall],
  )

  const patch = useCallback(
    (url, data = {}, config = {}) => {
      return apiCall(() => axiosClient.patch(url, data, config))
    },
    [apiCall],
  )
  const del = useCallback(
    (url, config = {}) => {
      return apiCall(() => axiosClient.delete(url, config))
    },
    [apiCall],
  )

  return {
    loading,
    error,
    clearError,
    apiCall,
    get,
    getSilence,
    post,
    put,
    patch,
    delete: del,
  }
}
