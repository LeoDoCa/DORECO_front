import Swal from "sweetalert2"

export const useConfirmAction = () => {
  const confirmAction = async ({
    title = "¿Estás seguro?",
    text = "Esta acción no se puede deshacer",
    confirmButtonText = "Sí, continuar",
    cancelButtonText = "Cancelar",
    icon = "warning",
    confirmButtonColor = "#0ea5e9",
    cancelButtonColor = "#6b7280",
  } = {}) => {
    const result = await Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonColor,
      cancelButtonColor,
      confirmButtonText,
      cancelButtonText,
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "btn-primary",
        cancelButton: "btn-secondary",
      },
      buttonsStyling: false,
    })

    return result.isConfirmed
  }

  const showSuccess = (message = "Operación completada exitosamente") => {
    return Swal.fire({
      icon: "success",
      title: "¡Éxito!",
      text: message,
      timer: 2000,
      showConfirmButton: false,
      customClass: {
        popup: "rounded-2xl",
      },
    })
  }

  const showError = (message = "Ha ocurrido un error") => {
    return Swal.fire({
      icon: "error",
      title: "Error",
      text: message,
      confirmButtonText: "Entendido",
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "btn-primary",
      },
    })
  }

  return {
    confirmAction,
    showSuccess,
    showError,
  }
}
