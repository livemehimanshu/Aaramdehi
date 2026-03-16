import React from 'react'
import {Link} from "react-router-dom";
import Search from "../search";
import Navigation from './navigation';
import Home from '../../src/Pages/Home';
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
                  <Link to="/order-tracking" className='text-[13px] link font-[500] transition'>Order Tracking</Link>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      <div className="header py-3  border-t-[1px] border-gray-250 border-b-[1px]">
        <div className="container flex items-center justify-between">

          <div className="col1 w-[25%]">
            <Link to="/home"><img src="/logo.png" /></Link>
          </div>

          <div className="col2 w-[45%]">
            <Search />
          </div>

          <div className="col3 w-[30%] flex items-center pl-7 ">
            <ul className='flex items-center gap-3 justify-end w-full'>
              <li className='list-none'>
                <Link to='/login' className='link transition text-[15px] font-[500] '>Login</Link>|<Link to='/register' className='link transition text-[15px] font-[500]'>register</Link>
              </li>
              <Tooltip title="compare">
                <li> <IconButton aria-label="cart">
                  <StyledBadge badgeContent={4} color="secondary">
                    <IoIosGitCompare />

                  </StyledBadge>
                </IconButton></li>
              </Tooltip>
              <Tooltip title="Cart">
                <li> <IconButton aria-label="cart">
                  <StyledBadge badgeContent={4} color="secondary">

                    <IoCartOutline />

                  </StyledBadge>
                </IconButton></li>
              </Tooltip>
              <Tooltip title="Wishlist">
                <li> <IconButton aria-label="cart">
                  <StyledBadge badgeContent={4} color="secondary">
                    <CiHeart />

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