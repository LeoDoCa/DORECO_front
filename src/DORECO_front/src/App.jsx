import { BrowserRouter } from "react-router-dom"
import { SkeletonTheme } from "react-loading-skeleton"
import { AuthProvider } from "@config/context/auth-context"
import AppRouter from "@router/AppRouter"

function App() {
  return (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <AppRouter />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </SkeletonTheme>
  )
}

export default App
