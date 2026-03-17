import React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

const Categorypanel = ({ isOpen, setIsopencatpanel }) => {
  // Removed local state, using parent's state

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={() => setIsopencatpanel(false)}>
      <List>
        {["Handicraft Home Furnishings",
  "Satin Cushions",
  "Satin Bolsters",
  "Satin Pillows",
  "Cotton Pillows",
  "Bed Sheets",
  "Floor Door Mat",
  "Floor Mats",
  "Cotton Dori Cushion",
  "White Soft Microfiber Pillow",
  "White Plain Fiber Pillow",
  "Plain White Fiber Bolster"].map((text) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['All mail', 'Trash', 'Spam'].map((text) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <Drawer open={isOpen} onClose={() => setIsopencatpanel(false)}>
        {DrawerList}
      </Drawer>
    </>
  );
}

export default Categorypanel;