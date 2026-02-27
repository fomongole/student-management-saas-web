import { Routes, Route } from 'react-router-dom'
// import Login from '@/pages/auth/Login' 

function App() {
  return (
    <Routes>
      {/* Placeholder route just to prove the theme works */}
      <Route 
        path="/" 
        element={
          <div className="flex h-screen items-center justify-center">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-slate-900">
                Elimu SaaS
              </h1>
              <p className="text-slate-500">
                Frontend Architecture Successfully Initialized.
              </p>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-md shadow-sm hover:bg-primary-700 transition-colors">
                Ready for Tomorrow
              </button>
            </div>
          </div>
        } 
      />
    </Routes>
  )
}

export default App