import React from 'react'
import "../search/style.css"
import Button from '@mui/material/Button';
import { FaSearch } from "react-icons/fa";


 const   Search = () => {
  return (
     <div className="search-Box w-full md:w-[400px] lg:w-[500px] h-[50px] md:h-[40px] lg:h-[50px] bg-[#e5e5e5] rounded-[15px] relative p-2">
          <input type="text" placeholder='search the product....' className='w-full h-[35px] md:h-[28px] lg:h-[35px] focus:outline-none bg-inherit px-2 text-[15px] md:text-[13px] lg:text-[15px]'/>
          <Button className='!absolute top-[8px] md:top-[4px] lg:top-[8px] right-[8px] md:right-[4px] lg:right-[8px] z-50 !w-[37px] md:!w-[32px] lg:!w-[37px] !min-w-[37px] md:!min-w-[32px] lg:!min-w-[37px] h-[37px] md:h-[32px] lg:h-[37px] !rounded-full !text-black' ><FaSearch className='text-[#4e4e4e] text-[25px] md:text-[18px] lg:text-[25px]' /></Button>
     </div>
  )
}
 export default Search;