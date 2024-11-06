import mongoose, { Schema, model, models } from 'mongoose';

export interface ISalary {
  user: mongoose.Types.ObjectId;
  employer: string;
  fromDate: Date;
  toDate: Date;
  receivedOn: Date;
  chequeNo?: string;
  deposited: boolean;
  amount: number;
  tip: number;
  tax: number;
  cpp: number;
  ei: number;
  vacPay: number;
  totalHours: number;
  wage: number;
  remark?: string;
}

const salarySchema = new Schema<ISalary>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  employer: { type: String, required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  receivedOn: { type: Date, required: true },
  chequeNo: String,
  deposited: { type: Boolean, default: false },
  amount: { type: Number, required: true },
  tip: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  cpp: { type: Number, default: 0 },
  ei: { type: Number, default: 0 },
  vacPay: { type: Number, default: 0 },
  totalHours: { type: Number, required: true },
  wage: { type: Number, required: true },
  remark: String
}, {
  timestamps: true
});

const Salary = models.Salary || model('Salary', salarySchema);

export default Salary;