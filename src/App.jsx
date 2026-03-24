
import './App.css'
import Header from '../component/header/index.jsx'
import Footer from '../component/Footer/Footer.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from '../component/Pages/Home/index.jsx'

import ProductListing from '../component/Pages/ProductListing/index.jsx'


function App() {
  return (
<>
 <BrowserRouter>
 <Header />
 <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/product" element={<ProductListing/>}/>
    
 </Routes>
 <Footer/>
 </BrowserRouter>
  
</>  
  )
}

export default App
