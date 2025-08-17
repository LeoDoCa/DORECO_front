import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import { useAuth } from "@config/context/auth-context"
import Skeleton from "react-loading-skeleton"
import Logo from "./../assets/logo.png"


const registerSchema = Yup.object().shape({
    name: Yup.string()
        .trim("No se permiten solo espacios en nombre")
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres")
        .required("El nombre es requerido")
        .test('not-empty', 'El nombre no puede estar vacío o solo contener espacios', value => value && value.trim() !== ''),
    surnames: Yup.string()
        .min(3, "El apellido debe tener al menos 3 caracteres")
        .max(50, "El apellido no puede exceder 50 caracteres")
        .required("El apellido es requerido"),
    username: Yup.string()
        .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
        .max(20, "El nombre de usuario no puede exceder 20 caracteres")
        .required("El nombre de usuario es requerido"),
    phone_number: Yup.string()
        .matches(/^\d{10}$/, "El teléfono debe tener 10 dígitos")
        .required("El teléfono es requerido"),
    email: Yup.string()
        .email("Ingresa un email válido")
        .required("El email es requerido")
        .test(
            "dominio-utez",
            "El correo debe terminar en @utez.edu.mx",
            value => value?.endsWith("@utez.edu.mx")),
    password: Yup.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "La contraseña debe contener al menos una mayúscula, una minúscula y un número",)
        .required("La contraseña es requerida"),
    password_confirm: Yup.string()
        .oneOf([Yup.ref("password"), null], "Las contraseñas deben coincidir")
        .required("Confirma tu contraseña"),
    terms: Yup.boolean().oneOf([true], "Debes aceptar los términos y condiciones"),
})

const Register = () => {
    const navigate = useNavigate()
    const { register, loading } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
        try {
            const payload = {
                name: values.name,
                surnames: values.surnames,
                username: values.username,
                phone_number: values.phone_number,
                email: values.email,
                password: values.password,
                password_confirm: values.password_confirm,

            };

            const result = await register(payload);

            if (result.success) {
                navigate("/login", { replace: true });
            } else {
                setFieldError("email", " ");
            }
        } catch (error) {
            console.error("Register error:", error);
        } finally {
            setSubmitting(false);
        }
    };


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
                        <Skeleton height={50} />
                        <Skeleton height={20} width={250} />
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
                        <h2 className="text-3xl font-bold text-[#28344F]">Crear Cuenta</h2>
                        <p className="mt-2 text-gray-600">Únete a DORECO y comienza a gestionar</p>
                    </div>
                    <Formik
                        initialValues={{
                            name: "",
                            surnames: "",
                            username: "",
                            phone_number: "",
                            email: "",
                            password: "",
                            password_confirm: "",
                            terms: false,
                        }}
                        validationSchema={registerSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting, errors, touched }) => (
                            <Form className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre Completo
                                    </label>
                                    <Field
                                        id="name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        className={`input-field ${errors.name && touched.name ? "border-red-500 focus:ring-red-500" : ""}`}
                                        placeholder="Tu nombre completo"
                                    />
                                    <ErrorMessage name="name" component="div" className="form-error" />
                                </div>
                                <div>
                                    <label htmlFor="surnames" className="block text-sm font-medium text-gray-700 mb-2">
                                        Apellido
                                    </label>
                                    <Field
                                        id="surnames"
                                        name="surnames"
                                        type="text"
                                        autoComplete="surnames"
                                        className={`input-field ${errors.surnames && touched.surnames ? "border-red-500 focus:ring-red-500" : ""}`}
                                        placeholder="Tu apellido"
                                    />
                                    <ErrorMessage name="surnames" component="div" className="form-error" />
                                </div>

                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre de Usuario
                                    </label>
                                    <Field
                                        id="username"
                                        name="username"
                                        type="text"
                                        autoComplete="username"
                                        className={`input-field ${errors.username && touched.username ? "border-red-500 focus:ring-red-500" : ""}`}
                                        placeholder="Tu nombre de usuario"
                                    />
                                    <ErrorMessage name="username" component="div" className="form-error" />
                                </div>

                                <div>
                                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                                        Teléfono
                                    </label>
                                    <Field
                                        id="phone_number"
                                        name="phone_number"
                                        type="text"
                                        autoComplete="tel"
                                        className={`input-field ${errors.phone_number && touched.phone_number ? "border-red-500 focus:ring-red-500" : ""}`}
                                        placeholder="Tu número de teléfono"/>
                                    <ErrorMessage name="phone_number" component="div" className="form-error" />
                                </div>

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

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                        Contraseña
                                    </label>
                                    <div className="relative">
                                        <Field
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            className={`input-field pr-12 ${errors.password && touched.password ? "border-red-500 focus:ring-red-500" : ""}`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <ErrorMessage name="password" component="div" className="form-error" />
                                </div>

                                <div>
                                    <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirmar Contraseña
                                    </label>
                                    <div className="relative">
                                        <Field
                                            id="password_confirm"
                                            name="password_confirm"
                                            type={showConfirmPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            className={`input-field pr-12 ${errors.password_confirm && touched.password_confirm ? "border-red-500 focus:ring-red-500" : ""}`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                                                    />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                    />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <ErrorMessage name="password_confirm" component="div" className="form-error" />
                                </div>

                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <Field
                                            id="terms"
                                            name="terms"
                                            type="checkbox"
                                            className="h-4 w-4 text-[#28344F] focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="terms" className="text-gray-700">
                                            Acepto los{" "}
                                            <a href="#" className="text-[#28344F] hover:text-primary-500 font-medium">
                                                términos y condiciones
                                            </a>{" "}
                                        </label>
                                        <ErrorMessage name="terms" component="div" className="form-error" />
                                    </div>
                                </div>

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
                                            Creando cuenta...
                                        </>
                                    ) : (
                                        "Crear Cuenta"
                                    )}
                                </button>
                            </Form>
                        )}
                    </Formik>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            ¿Ya tienes una cuenta?{" "}
                            <Link to="/login" className="font-medium text-blue-900 hover:text-blue-800 transition-colors">
                                Inicia sesión aquí
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register
