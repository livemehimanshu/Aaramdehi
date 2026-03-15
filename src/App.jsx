
import './App.css'
import Header from '../component/header/index.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './Pages/Home/index.jsx'

function App() {
  return (
<>
 <BrowserRouter>
 <Header />
 <Routes>
      <Route path={ "/"} exact={true} element={Home}/>
 </Routes>
 </BrowserRouter>
  
</>  
  )
}

export default App
