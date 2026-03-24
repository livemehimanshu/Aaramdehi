import React, { useState, useMemo } from 'react';
import Sidebar from '../../Sidebar'; 
import Pagination from '@mui/material/Pagination'; // MUI Pagination इम्पोर्ट करें
import Stack from '@mui/material/Stack';

const ALL_PRODUCTS_DATA = [
  // ... आपका डेटा (यहाँ कम से कम 10-12 प्रोडक्ट्स डालें ताकि पेजिंग दिखे)
  { id: 1, name: "White Soft Microfiber Pillow", price: 5949, oldPrice: 8999, rating: 4.2, reviews: "2,450", image: "https://via.placeholder.com/200" },
  { id: 2, name: "Satin Plain White Fiber Bolster", price: 849, oldPrice: 1599, rating: 4.5, reviews: "1,120", image: "https://via.placeholder.com/200" },
  { id: 3, name: "Cotton Dori Cushion", price: 399, oldPrice: 799, rating: 4.0, reviews: "850", image: "https://via.placeholder.com/200" },
  { id: 4, name: "Handicraft Bed Sheet", price: 1250, oldPrice: 2499, rating: 4.8, reviews: "320", image: "https://via.placeholder.com/200" },
  { id: 5, name: "Premium Bed Cover", price: 2100, oldPrice: 3500, rating: 4.6, reviews: "150", image: "https://via.placeholder.com/200" },
  { id: 6, name: "Luxury Silk Pillow", price: 4500, oldPrice: 6000, rating: 4.9, reviews: "90", image: "https://via.placeholder.com/200" },
];

const ProductPage = () => {
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState('relevance');
  
  // --- Pagination States ---
  const [page, setPage] = useState(1);
  const productsPerPage = 4; // एक पेज पर कितने प्रोडक्ट दिखाने हैं

  const handlePriceFilter = (value) => {
    setMaxPrice(value);
    setPage(1); // फिल्टर बदलने पर पहले पेज पर वापस जाएँ
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0); // पेज बदलने पर ऊपर स्क्रॉल करें
  };

  const filteredAndSorted = useMemo(() => {
    let data = ALL_PRODUCTS_DATA.filter(product => product.price <= maxPrice);
    if (sortBy === 'lowToHigh') data = [...data].sort((a, b) => a.price - b.price);
    if (sortBy === 'highToLow') data = [...data].sort((a, b) => b.price - a.price);
    return data;
  }, [maxPrice, sortBy]);

  // --- पेज के हिसाब से डेटा काटना ---
  const indexOfLastItem = page * productsPerPage;
  const indexOfFirstItem = indexOfLastItem - productsPerPage;
  const currentItems = filteredAndSorted.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAndSorted.length / productsPerPage);

  return (
    <div className="flex bg-[#f1f3f6] min-h-screen p-4 gap-4">
      <aside className="hidden lg:block w-[280px] flex-shrink-0 bg-white shadow-sm h-fit sticky top-20">
         <Sidebar onPriceChange={handlePriceFilter} />
      </aside>

      <main className="flex-1 bg-white shadow-sm flex flex-col rounded-sm">
        {/* Sort Bar */}
        <div className="flex items-center gap-8 p-4 border-b sticky top-0 bg-white z-[10]">
          <span className="font-bold text-gray-500 text-xs uppercase">Sort By</span>
          <button onClick={() => setSortBy('relevance')} className={`pb-1 text-sm font-bold border-b-2 ${sortBy === 'relevance' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent'}`}>Relevance</button>
          <button onClick={() => setSortBy('lowToHigh')} className={`pb-1 text-sm font-bold border-b-2 ${sortBy === 'lowToHigh' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent'}`}>Price -- Low to High</button>
          <button onClick={() => setSortBy('highToLow')} className={`pb-1 text-sm font-bold border-b-2 ${sortBy === 'highToLow' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent'}`}>Price -- High to Low</button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-4 flex-grow">
          {currentItems.map((item) => (
            <div key={item.id} className="p-3 border border-gray-100 hover:shadow-lg transition-shadow rounded-md">
               {/* प्रोडक्ट का कंटेंट यहाँ */}
               <div className="h-40 flex items-center justify-center mb-2">
                 <img src={item.image} alt={item.name} className="max-h-full object-contain" />
               </div>
               <h3 className="text-sm font-medium h-10 line-clamp-2">{item.name}</h3>
               <div className="font-bold mt-2 text-lg">₹{item.price}</div>
            </div>
          ))}
        </div>

        {/* --- PAGING SECTION (The code you asked for) --- */}
        <div className="p-6 border-t flex flex-col items-center gap-4 bg-white">
          <Stack spacing={2}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
              shape="rounded"
              showFirstButton 
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  fontWeight: 'bold',
                },
                '& .Mui-selected': {
                  backgroundColor: '#2874f0 !important', // Flipkart Blue
                  color: 'white',
                }
              }}
            />
          </Stack>
          <p className="text-sm text-gray-500 font-medium">
            Showing {indexOfFirstItem + 1} – {Math.min(indexOfLastItem, filteredAndSorted.length)} of {filteredAndSorted.length} products
          </p>
        </div>
      </main>
    </div>
  );
};

export default ProductPage;