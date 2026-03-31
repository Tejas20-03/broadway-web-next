'use client';

import React from 'react';
import { AccountPage } from '@/components/views/AccountPage';

interface MyAccountPageProps {
  isOpen: boolean;
  onClose: () => void;
  onViewOrder?: (orderId: string, encOrderId: string) => void;
}

export const MyAccountPage: React.FC<MyAccountPageProps> = (props) => {
  return <AccountPage {...props} />;
};
