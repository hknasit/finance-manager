// types/transaction.ts

export interface CloudinaryAsset {
  publicId: string;
  url: string;
  thumbnailUrl: string;
}

export interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod: 'card' | 'cash';
  image?: CloudinaryAsset;
  notes?: string;
}

  
  export interface FilterState {
    type: "all" | "income" | "expense";
    category: string;
    paymentMethod: "all" | "card" | "cash";
    startDate: string;
    endDate: string;
  }
  
  export interface TransactionsByDate {
    [key: string]: {
      formattedDate: string;
      transactions: Transaction[];
    };
  }
  
  export interface TransactionTotals {
    income: number;
    expense: number;
  }