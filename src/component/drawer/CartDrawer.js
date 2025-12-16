import React, { useContext } from 'react';
import dynamic from 'next/dynamic';
import Drawer from 'rc-drawer';

// Internal import
import Cart from '@component/cart/Cart';
import { SidebarContext } from '@context/SidebarContext';

const CartDrawer = () => {
  const { cartDrawerOpen, closeCartDrawer } = useContext(SidebarContext);

  return (
    <Drawer
      open={cartDrawerOpen}
      onClose={closeCartDrawer}
      parent={null}
      level={null}
      placement={'left'}
      // width={500}
    >
      <Cart />
    </Drawer>
  );
};
export default dynamic(() => Promise.resolve(CartDrawer), { ssr: false });
