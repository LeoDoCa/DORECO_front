# DORECO_front

## Integrantes del Equipo
- Andrés Yismael Díaz Hernández
- Leonardo Daniel Dorantes Castañeda
- Brandon Alfredo Hernández Rodríguez
- Vulmaro Alberto Martínez Verdugo
- Martin Ortega Montes
- Anett Yomali Vera Carbajal

## Descripción del Sistema
El proyecto DORECO (Donación y Reciclaje en la Comunidad Universitaria) es un sistema orientado a fomentar la cultura del reciclaje, consumo responsable, reutilización y apoyo colaborativo dentro de la comunidad universitaria.  
Esta es la parte frontend del proyecto, desarrollada utilizando React.js, encargada de brindar una interfaz gráfica intuitiva para que los estudiantes puedan:  
- Publicar objetos con fotografías, descripciones, estado y categoría.
- Buscar, filtrar y solicitar objetos publicados por otros usuarios.
- Acceder fácilmente a la información de cada artículo mediante códigos QR.
- Visualizar estadísticas y reportes mediante un módulo de administración (para usuarios administradores).

## Estructura de Carpetas
```bash
DORECO_front/
├── assets/
|   └── test_assets.txt
├── data/
|   └── test_data.txt
├── docs/
|   └── test_docs.txt 
├── src/
│   └── DORECO_front/
│       ├── src/
│       │   ├── auth/
│       |   |   ├── Login.jsx
│       |   |   └── Register.jsx
│       │   ├── config/
│       |   │   ├── context/
│       |   |   │   ├── auth-context.jsx
│       |   |   │   └── auth-manager.js
│       |   │   └── http-client/
│       |   |       └── axios-client.js
│       │   ├── router/
│       |   |   └── AppRouter.jsx
│       │   ├── App.jsx
│       │   ├── index.css
│       │   └── main.jsx
│       ├── .env
│       ├── .gitignore
│       ├── eslint.config.js
│       ├── index.html
│       ├── package-lock.json
│       ├── package.json
│       └── vite.config.js
├── tests/
|   └── test_tests.txt             
└── README.md             
```

## Requisitos Previos
- Node.js >= 16.x
- npm >= 9.x

## Cómo Clonar, Instalar y Correr el Proyecto
```bash
# 1. Clonar el repositorio
git clone https://github.com/LeoDoCa/DORECO_front.git

# 2. Acceder a la carpeta del proyecto
cd .\src\
cd .\DORECO_front\

# 3. Instalar dependencias
npm install

# 4. Instalar librerías adicionales necesarias
npm install axios formik yup react-router-dom animate.css flowbite flowbite-react sweetalert2 sweetalert2-react-content

# 5. Correr el archivo 
npm run dev
```

## Notas Adicionales
- Este frontend está diseñado para conectarse con el backend desarrollado en Django (repositorio: DORECO_back).
- Asegúrate de que el backend esté corriendo en su servidor local correspondiente (normalmente en http://localhost:8000) para pruebas completas de integración.
- Este proyecto utiliza React Router, SweetAlert2, Formik, Yup, entre otras librerías para una mejor experiencia de usuario.
