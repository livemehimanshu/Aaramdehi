import React, { useState } from 'react';
import Button from '@mui/material/Button';


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md p-4">
       <div className="container flex items-center justify-end">
               <div className="col_1">
                   <Button className='!text-black'>shop by category</Button>
               </div>
       </div>
    </nav>
  );
};

export default Navbar;