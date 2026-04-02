import './App.css'
import Header from '../component/header/index.jsx'
import Footer from '../component/Footer/Footer.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from '../component/Pages/Home/index.jsx'
import ProductListing from '../component/Pages/ProductListing/index.jsx'
import ProductDetailsPage from '../component/Pages/productpage/ProductDetailsPage.jsx'
import Auth from '../component/Pages/Home/auth.jsx' // Auth पेज यहाँ इम्पोर्ट करें
import { BlogList, BlogDetail } from '../../Aaramdehi/component/Pages/blog/blog.jsx';

function App() {
  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          {/* Main Pages */}
          <Route path="/" element={<Home/>}/>
          <Route path="/product" element={<ProductListing/>}/>
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          
          {/* --- LOGIN & REGISTER ROUTES --- */}
          {/* हमने दोनों के लिए एक ही कंपोनेंट रखा है क्योंकि उसमें टॉगल बटन है */}
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/product" element={<ProductListing />} />
          <Route path="/blog" element={<BlogList />} />
<Route path="/blog/:slug" element={<BlogDetail />} />
        </Routes>
        <Footer/>
      </BrowserRouter>
    </>  
  )
}

export default App;