
import './App.css'
import Header from '../component/header/index.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from '../component/Pages/Home/index.jsx'


function App() {
  return (
<>
 <BrowserRouter>
 <Header />
 <Routes>
      <Route path="/" element={<Home/>}/>
    
 </Routes>
 </BrowserRouter>
  
</>  
  )
}

export default App
