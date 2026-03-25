'use client';

import { useRouter } from 'next/navigation';
import { CheckoutPage } from '@/components/views/CheckoutPage';
import { useCart } from '@/context/CartContext';
import { useAppDispatch, useAppSelector } from '@/store';
import { cartActions } from '@/store/slices/cartSlice';
import { uiActions } from '@/store/slices/uiSlice';

export default function CheckoutRoute() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { cartItems } = useCart();
  const checkoutVoucher = useAppSelector(s => s.ui.checkoutVoucher);
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const handlePlaceOrder = (orderAddress?: string, orderId?: string, encOrderId?: string) => {
    dispatch(cartActions.clearCart());
    dispatch(uiActions.setCheckoutVoucher({ code: '', amount: 0 }));
    if (encOrderId) {
      router.replace(`/order/${encOrderId}`);
    } else {
      router.replace('/');
    }
  };

  return (
    <CheckoutPage
      isOpen={true}
      onBack={() => router.back()}
      cartItems={cartItems}
      subtotal={subtotal}
      discountAmount={checkoutVoucher.amount}
      voucher={checkoutVoucher.code}
      onPlaceOrder={handlePlaceOrder}
    />
  );
}
