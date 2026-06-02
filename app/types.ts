export type UserRole = 'ADMIN' | 'SELLER' | 'CUSTOMER';

export type Category = 
  | 'ELECTRONICS' 
  | 'FASHION' 
  | 'HOME' 
  | 'HEALTH' 
  | 'SPORTS' 
  | 'TOYS';

export type Status = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: number;
  userId: number;
  name: string;
  photo: string;
  user?: User; 
}

export interface Customer {
  id: number;
  userId: number;
  name: string;
  address?: string;
  phone?: string;
  photo: string;
  user?: User; 
}

export interface Seller {
  id: number;
  userId: number;
  name: string;  
  owner: string; 
  address?: string; 
  phone?: string;
  photo: string;
  user?: User;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  category: Category;
  price: number;
  stock: number;
  photo: string; 
  sold: number;
  sellerId: number;
  seller?: Seller; 
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: number;
  customerId: number;
  productId: number;
  amount: number;
  customer?: Customer;
  product?: Product; 
}


export interface TransactionItem {
  id: number;
  transactionId: number;
  productId: number;
  amount: number;
  price: number; 
  transaction?: Transaction;
  product?: Product;
}

export interface Transaction {
  id: number;
  customerId: number;
  status: Status;
  totalPrice: number;
  paymentProof?: string; 
  transactionItems: TransactionItem[];
  customer?: Customer; 
  createdAt: string;
  updatedAt: string;
}