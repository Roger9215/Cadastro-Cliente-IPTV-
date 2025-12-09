export enum Platform {
  KRON = 'KRON',
  VOLT = 'VOLT'
}

export enum PaymentStatus {
  ADIMPLENTE = 'ADIMPLENTE',
  INADIMPLENTE = 'INADIMPLENTE'
}

export interface Customer {
  id: string; // Internal UUID
  customerId: string; // Custom ID input by user
  name: string;
  signupDate: string;
  screenCount: number;
  appName: string;
  planPrice: number;
  platform: Platform;
  paymentStatus: PaymentStatus;
  dueDate: string;
  discount: number;
  bonus: string;
  phone: string;
}

export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  totalRevenue: number;
  expiringSoon: number;
}