
import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { useApi } from "@hooks/useApi"
import Skeleton from "react-loading-skeleton"
import Logo from "./../assets/logo.png"

const resetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("La contraseña es requerida"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], "Las contraseñas deben coincidir")
    .required("Confirma tu contraseña"),
})

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { post, loading } = useApi()
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [token, setToken] = useState("")

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token')
    if (!tokenFromUrl) {
      setError("Token inválido o expirado")
      return
    }
    setToken(tokenFromUrl)
  }, [searchParams])

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    setMessage("")
    setError("")
    
    if (!token) {
      setError("Token inválido o expirado")
      setSubmitting(false)
      return
    }

    try {
      const result = await post("/auth/password-reset-confirm/", { 
        token: token,
        new_password: values.password,
        new_password_confirm: values.confirmPassword
      })
      
      if (result.success) {
        setMessage("Contraseña cambiada exitosamente. Redirigiendo al login...")
        setTimeout(() => {
          navigate("/login", { replace: true })
        }, 3000)
      } else {
        setError(result.error || "No se pudo cambiar la contraseña. Intenta de nuevo.")
      }
    } catch (error) {
      setError("Error inesperado. Intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Skeleton height={40} width={200} className="mx-auto" />
            <Skeleton height={20} width={300} className="mx-auto mt-2" />
          </div>
          <div className="card space-y-6">
            <Skeleton height={50} />
            <Skeleton height={50} />
            <Skeleton height={50} />
            <Skeleton height={45} />
            <Skeleton height={20} width={200} className="mx-auto" />
          </div>
        </div>
      </div>
    )
  }

  if (!token && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="card text-center">
            <img src={Logo} alt="DORECO Logo" className="mx-auto mb-6 h-20 w-auto" />
            <h2 className="text-3xl font-bold text-[#28344F] mb-4">Token inválido</h2>
            <p className="text-red-600 mb-6">El enlace de recuperación no es válido o ha expirado.</p>
            <Link 
              to="/forgetpassword" 
              className="btn-primary inline-block"
            >
              Solicitar nueva recuperación
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="card">
          <img src={Logo} alt="DORECO Logo" className="mx-auto mb-6 h-20 w-auto" />
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-[#28344F]">Nueva contraseña</h2>
            <p className="mt-2 text-[#394867]">Ingresa tu nueva contraseña</p>
          </div>
          
          <Formik 
            initialValues={{ password: "", confirmPassword: "" }} 
            validationSchema={resetPasswordSchema} 
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <Field
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className={`input-field pr-12 ${errors.password && touched.password ? "border-red-500 focus:ring-red-500" : ""}`}
                      placeholder="Ingresa tu nueva contraseña"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="div" className="form-error" />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className={`input-field pr-12 ${errors.confirmPassword && touched.confirmPassword ? "border-red-500 focus:ring-red-500" : ""}`}
                      placeholder="Confirma tu nueva contraseña"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <ErrorMessage name="confirmPassword" component="div" className="form-error" />
                </div>

                {message && <div className="text-green-600 text-sm text-center font-medium">{message}</div>}
                {error && <div className="form-error text-center">{error}</div>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Cambiando contraseña...
                    </>
                  ) : (
                    "Cambiar contraseña"
                  )}
                </button>
              </Form>
            )}
          </Formik>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              <Link to="/login" className="font-medium text-gray-600 hover:text-[#394867] transition-colors">
                Regresar a inicio de sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword