import {Routes , Route} from "react-router-dom"
import './App.css'
import IndexPage from "./pages/IndexPage.jsx"
import LoginPage from "./pages/LoginPage";
import Layout from "./Layout.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";


function App() {

  return (

    <Routes>

      <Route path="/"element={<Layout/>}>
        <Route index element={<IndexPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      
    </Routes>
    
  )
}

export default App
