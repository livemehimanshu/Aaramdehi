import React from 'react'
import {Link} from "react-router-dom";
import Search from "../search";
import Navigation from './navigation';
import Home from '../Pages/Home';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import { IoCartOutline } from "react-icons/io5";
import { IoIosGitCompare } from "react-icons/io";
import { CiHeart } from "react-icons/ci";
import Tooltip from '@mui/material/Tooltip';



const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${(theme.vars ?? theme).palette.background.paper}`,
    padding: '0 4px',
  },
}));
 const Header = () => {
  return (
   <><header className='bg-white'>
      <div className="top-strip py-2 border-t-[1px] border-gray-250 border-b-[1px] hidden md:block">
        <div className="container ">
          <div className="flex items-center justify-between">
            <div className="col1 w-full md:w-[50%]">
              <p className="text-[11px] md:text-[12px] font-[500]">Get up to 50% off new season items , limited only</p>
            </div>

            <div className="col2 flex items-center justify-end">
              <ul className='flex justify-center gap-2'>
                <li className="list-none">
                  <Link to="/help-center" className='text-[11px] md:text-[13px] link font-[500] transition'>Help center</Link>
                </li>
                <li className="list-none">
                  <Link to="/order-tracking" className='text-[11px] md:text-[13px] link font-[500] transition'>Order Tracking</Link>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      <div className="header py-3 md:py-4 border-t-[1px] border-gray-250 border-b-[1px]">
        <div className="container flex items-center justify-between flex-col md:flex-row gap-2 md:gap-0">

          <div className="col1 w-[40%] md:w-[25%] flex justify-center md:justify-start">
            <Link to="/home"><img src="/logo.png" className='w-28 md:w-48' /></Link>
          </div>

          <div className="col2 w-full md:w-[45%] px-2 md:px-0">
            <Search />
          </div>

          <div className="col3 w-full md:w-[30%] flex items-center justify-center md:justify-end gap-1 md:gap-0 md:pl-7 ">
            <ul className='flex items-center gap-1 md:gap-3 justify-center md:justify-end w-full'>
              <li className='list-none hidden sm:block'>
                <Link to='/login' className='link transition text-[11px] md:text-[15px] font-[500] '>Login</Link><span className='hidden md:inline'>|</span><Link to='/register' className='link transition text-[11px] md:text-[15px] font-[500]'>register</Link>
              </li>
              <Tooltip title="compare">
                <li> <IconButton aria-label="cart" className='!p-1 md:!p-2'>
                  <StyledBadge badgeContent={4} color="secondary">
                    <IoIosGitCompare className='text-[18px] md:text-[24px]' />

                  </StyledBadge>
                </IconButton></li>
              </Tooltip>
              <Tooltip title="Cart">
                <li> <IconButton aria-label="cart" className='!p-1 md:!p-2'>
                  <StyledBadge badgeContent={4} color="secondary">

                    <IoCartOutline className='text-[18px] md:text-[24px]' />

                  </StyledBadge>
                </IconButton></li>
              </Tooltip>
              <Tooltip title="Wishlist">
                <li> <IconButton aria-label="cart" className='!p-1 md:!p-2'>
                  <StyledBadge badgeContent={4} color="secondary">
                    <CiHeart className='text-[18px] md:text-[24px]' />

                  </StyledBadge>
                </IconButton></li>
              </Tooltip>
            </ul>
          </div>

        </div>
      </div>


      <Navigation />


    </header>
    </>

  )
}
export default Header