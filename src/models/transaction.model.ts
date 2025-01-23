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

// models/transaction.model.ts
import mongoose, { Schema, Document } from 'mongoose';

const TransactionSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    required: true, 
    enum: ['income', 'expense'] 
  },
  category: { 
    type: String, 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true, 
    default: Date.now 
  },
  paymentMethod: { 
    type: String, 
    required: true, 
    enum: ['card', 'cash'] 
  },
  image: {
    publicId: String,
    url: String,
    thumbnailUrl: String
  },
  notes: String
}, { 
  timestamps: true 
});

// Add index for better query performance
TransactionSchema.index({ user: 1, date: -1 });
TransactionSchema.index({ user: 1, type: 1 });
TransactionSchema.index({ user: 1, category: 1 });

export type ITransaction = Document & Transaction;

export default mongoose.models.Transaction || 
  mongoose.model<ITransaction>('Transaction', TransactionSchema);