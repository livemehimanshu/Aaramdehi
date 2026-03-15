import React from 'react'
import {Link} from "react-router-dom";
import Search from "../search";
 const Header = () => {
  return (
   <header>
    <div className="top-strip py-2 border-t-[1px] border-gray-250 border-b-[1px]">
      <div className="container ">
        <div className="flex items-center justify-between">
             <div className="col1 w-[50%]">
              <p className="text-[12px] font-[500]">Get up to 50% off new season items , limited only</p>
             </div>
       
         <div className="col2 flex items-center justify-end">
              <ul className='flex justify-center gap-2'>
                <li className="list-none">
                    <Link to="/help-center" className='text-[13px] link font-[500] transition'>Help center</Link>
                </li>
                <li className="list-none">
                    <Link to="/order-tracking"  className='text-[13px] link font-[500] transition'>Order Tracking</Link>
                </li>
              </ul>
         </div>
 
 </div>
 </div>
        </div> 
     <div className="header py-3 ">
       <div className="container flex items-center justify-between">

         <div className="col1 w-[25%]">
          <Link to="/home" ><img src="/logo.png"/></Link>
         </div>

         <div className="col2 w-[45%]">
             <Search />
         </div>

         <div className="col3 w-[30%]"></div>

       </div>
     </div>


   
    
   </header>
  )
}
export default Header