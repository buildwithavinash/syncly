import { Route, Routes } from "react-router"
import CreateListPage from "./pages/CreateListPage"
import HomePage from "./pages/HomePage"
import SignupPage from "./pages/SignupPage"
import LoginPage from "./pages/LoginPage"

const App = () => {
  return (
   <>
    <Routes>
    <Route path="/" element={<HomePage/>}/>
    <Route path="/create-list" element={<CreateListPage/>}/>
    <Route path="/signup" element={<SignupPage/>}/>
    <Route path="/login" element={<LoginPage/>}/>
    
    
    </Routes>
   </>
  )
}

export default App