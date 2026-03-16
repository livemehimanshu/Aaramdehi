import React from 'react'
import "../search/style.css"
import Button from '@mui/material/Button';
import { FaSearch } from "react-icons/fa";


 const   Search = () => {
  return (
     <div className="search-Box w-[100%] h-[50px] bg-[#e5e5e5] rounded-[5px] relative p-2">
          <input type="text" placeholder='search the product....' className='w-full h-[35px] focus:outline-none bg-inherit p-2 text-[15px]'/>
          <Button className='!absolute top-[8px] right-[8px] z-50 !w-[37px] !min-w-[37px] h-[37px] !rounded-full !text-black' ><FaSearch className='text-[#4e4e4e] text-[25px]' /></Button>
     </div>
  )
}
 export default Search;