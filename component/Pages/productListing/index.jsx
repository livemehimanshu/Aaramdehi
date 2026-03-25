import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom'; // 1. Link इम्पोर्ट करें
import Sidebar from '../../Sidebar'; 
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const ALL_PRODUCTS_DATA = [
  { 
    id: 1, 
    name: "White Soft Microfiber Pillow (Pack of 2)", 
    price: 5949, 
    oldPrice: 8999, 
    rating: 4.2, 
    reviews: "2,450", 
    image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/t/v/v/17-white-soft-microfiber-pillow-pack-of-2-17-27-2-p-2-m-p-2-original-imahfzhgzff9ay8h.jpeg?q=70" 
  },
  { 
    id: 2, 
    name: "Satin Plain White Fiber Bolster", 
    price: 849, 
    oldPrice: 1599, 
    rating: 4.5, 
    reviews: "1,120", 
    image: "https://rukminim2.flixcart.com/image/612/612/k7f26kw0/bolster/v/j/z/plain-bolster-white-1-bolster-white-satin-plain-white-fiber-original-imafpnzdqghvggym.jpeg?q=70" 
  },
  { 
    id: 3, 
    name: "Cotton Dori Cushion with Filler", 
    price: 399, 
    oldPrice: 799, 
    rating: 4.0, 
    reviews: "850", 
    image: "https://rukminim2.flixcart.com/image/612/612/xif0q/cushion/v/f/e/12-12-dori-cushion-with-filler-1-12-cushion-with-filler-original-imahyyzqfgy6gyh7.jpeg?q=70" 
  },
  { 
    id: 4, 
    name: "Handicraft Cotton Double Bed Sheet", 
    price: 1250, 
    oldPrice: 2499, 
    rating: 4.8, 
    reviews: "320", 
    image: "https://rukminim2.flixcart.com/image/612/612/xif0q/bedsheet/e/r/s/1-1-floral-premium-cotton-double-bedsheet-with-2-pillow-covers-original-imahf6fhz9z7zgzp.jpeg?q=70" 
  },
  { 
    id: 5, 
    name: "Premium Quilted Bed Cover (Grey)", 
    price: 2100, 
    oldPrice: 3500, 
    rating: 4.6, 
    reviews: "150", 
    image: "https://rukminim2.flixcart.com/image/612/612/xif0q/bedsheet/z/k/w/1-1-luxury-ultra-soft-quilted-bedspread-original-imahf4zzy3zzzzzz.jpeg?q=70" 
  },
  { 
    id: 6, 
    name: "Luxury Silk Feel Decorative Pillow", 
    price: 4500, 
    oldPrice: 6000, 
    rating: 4.9, 
    reviews: "90", 
    image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/j/p/w/16-24-luxury-silk-fiber-pillow-original-imagpgy8yzf3gzgz.jpeg?q=70" 
  },
  { 
    id: 7, 
    name: "Orthopedic Memory Foam Pillow", 
    price: 1299, 
    oldPrice: 2999, 
    rating: 4.4, 
    reviews: "1,850", 
    image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/m/l/p/12-24-memory-foam-pillow-with-bamboo-cover-original-imaguyy9zf8gzgzg.jpeg?q=70" 
  },
  { 
    id: 8, 
    name: "Microfiber Travel Neck Pillow", 
    price: 499, 
    oldPrice: 999, 
    rating: 4.1, 
    reviews: "540", 
    image: "https://rukminim2.flixcart.com/image/612/612/xif0q/pillow/u/v/m/11-12-u-shaped-travel-neck-pillow-original-imahf8yfzfghzzzz.jpeg?q=70" 
  }
];

const ProductPage = () => {
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);
  const productsPerPage = 4;

  const handlePriceFilter = (value) => {
    setMaxPrice(value);
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  const filteredAndSorted = useMemo(() => {
    let data = ALL_PRODUCTS_DATA.filter(product => product.price <= maxPrice);
    if (sortBy === 'lowToHigh') data = [...data].sort((a, b) => a.price - b.price);
    if (sortBy === 'highToLow') data = [...data].sort((a, b) => b.price - a.price);
    return data;
  }, [maxPrice, sortBy]);

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
            // 2. पूरे कार्ड को Link में रैप करें
            <Link 
              to={`/product/${item.id}`} 
              key={item.id} 
              className="p-3 border border-gray-100 hover:shadow-lg transition-shadow rounded-md block group"
            >
               <div className="h-40 flex items-center justify-center mb-2 overflow-hidden">
                 <img 
                   src={item.image} 
                   alt={item.name} 
                   className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                 />
               </div>
               <h3 className="text-sm font-medium h-10 line-clamp-2 text-gray-800 group-hover:text-blue-600">
                 {item.name}
               </h3>
               <div className="flex items-center gap-2 mt-2">
                 <span className="font-bold text-lg text-gray-900">₹{item.price}</span>
                 {item.oldPrice && <span className="text-gray-400 line-through text-xs italic">₹{item.oldPrice}</span>}
               </div>
            </Link>
          ))}
        </div>

        {/* Paging Section */}
        <div className="p-6 border-t flex flex-col items-center gap-4 bg-white">
          <Stack spacing={2}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange} 
              color="primary" 
              shape="rounded"
              sx={{
                '& .Mui-selected': { backgroundColor: '#2874f0 !important', color: 'white' }
              }}
            />
          </Stack>
        </div>
      </main>
    </div>
  );
};

export default ProductPage;