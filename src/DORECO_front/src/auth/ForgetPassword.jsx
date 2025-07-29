
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { useAuth } from "@config/context/auth-context"
import Skeleton from "react-loading-skeleton"
import Logo from "./../assets/logo.png"

const loginSchema = Yup.object().shape({
  email: Yup.string().email("Ingresa un email válido").required("El email es requerido"),
})

const ForgetPassword = () => {
  const navigate = useNavigate()
  const { login, loading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const result = await login(values)

      if (result.success) {
        navigate("/dashboard", { replace: true })
      } else {
        setFieldError("email", " ")
      }
    } catch (error) {
      console.error("Email error:", error)
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
            <Skeleton height={45} />
            <Skeleton height={20} width={200} className="mx-auto" />
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
          <h2 className="text-3xl font-bold text-[#28344F]">Recuperar contraseña</h2>
          <p className="mt-2 text-[#394867]">Accede a tu cuenta de DORECO</p>
        </div>
          <Formik initialValues={{ email: "", password: "" }} validationSchema={loginSchema} onSubmit={handleSubmit}>
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-6">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className={`input-field ${errors.email && touched.email ? "border-red-500 focus:ring-red-500" : ""}`}
                    placeholder="tu@email.com"
                  />
                  <ErrorMessage name="email" component="div" className="form-error" />
                </div>

                {/* Submit Button */}
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
                      Iniciando sesión...
                    </>
                  ) : (
                    "Envirar solicitud de recuperación"
                  )}
                </button>
              </Form>
            )}
          </Formik>

          {/* Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-3">
              <Link to="/login" className="font-medium text-gray-600 hover:text-[#394867] transition-colors">
                Regresar a inicio de sesión
              </Link>
            </p>

            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{" "}
              <Link to="/register" className="font-medium text-[#28344F] hover:text-[#394867] transition-colors">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgetPassword
