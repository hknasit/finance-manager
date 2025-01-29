import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/transaction.model";
import { verifyAuth } from "@/lib/auth";
import { UserPreference } from "@/models/user-preferences.model";

interface ParamsPut {
  params: Promise<{
    id: number;
  }>;
}

interface ParamsDelete {
  params: Promise<{
    id: number;
  }>;
}

export async function PUT(req: NextRequest, params: ParamsPut) {
  try {
    const { id } = await params.params;
    const authPayload = await verifyAuth();
    if (!authPayload.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    const {
      type,
      category,
      amount,
      description,
      date,
      paymentMethod,
      image,
      currentCashBalance,
      currentBankBalance,
    } = body;

    // Fetch existing transaction
    const existingTransaction = await Transaction.findOne({
      _id: id,
      user: authPayload.id,
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 }
      );
    }

    // Calculate balance adjustments
    const balanceAdjustment = amount - existingTransaction.amount;
    let newCashBalance = currentCashBalance;
    let newBankBalance = currentBankBalance;

    if (paymentMethod === "cash") {
      newCashBalance =
        type === "income"
          ? currentCashBalance + balanceAdjustment
          : currentCashBalance - balanceAdjustment;
    } else {
      newBankBalance =
        type === "income"
          ? currentBankBalance + balanceAdjustment
          : currentBankBalance - balanceAdjustment;
    }

    // Validate balances
    if (newCashBalance < 0 || newBankBalance < 0) {
      return NextResponse.json(
        { message: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Update user preferences with new balances
    await UserPreference.findOneAndUpdate(
      { user: authPayload.id },
      {
        $set: {
          cashBalance: newCashBalance,
          bankBalance: newBankBalance,
        },
      }
    );

    // Update transaction
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      {
        type,
        category,
        amount,
        description,
        date: new Date(date),
        paymentMethod,
        image,
      },
      { new: true }
    );

    return NextResponse.json({
      message: "Transaction updated successfully",
      transaction: updatedTransaction,
      balances: {
        cashBalance: newCashBalance,
        bankBalance: newBankBalance,
      },
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { message: "Error updating transaction" },
      { status: 500 }
    );
  }
}

// Patch specific fields
export async function PATCH(req: NextRequest, params: ParamsDelete) {
  try {
    const { id } = await params.params;
    const authPayload = await verifyAuth();
    if (!authPayload.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const updates = await req.json();

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, user: authPayload.id },
      { $set: updates },
      { new: true }
    );

    if (!transaction) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      { message: "Error updating transaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, params: ParamsDelete) {
  try {
    const { id } = await params.params;
    const authPayload = await verifyAuth();
    if (!authPayload.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch transaction to get details for balance adjustment
    const transaction = await Transaction.findOne({
      _id: id,
      user: authPayload.id,
    });

    if (!transaction) {
      return NextResponse.json(
        { message: "Transaction not found" },
        { status: 404 }
      );
    }

    // Get current balances
    const userPreferences = await UserPreference.findOne({
      user: authPayload.id,
    });
    if (!userPreferences) {
      return NextResponse.json(
        { message: "User preferences not found" },
        { status: 404 }
      );
    }

    // Calculate new balances
    let newCashBalance = userPreferences.cashBalance;
    let newBankBalance = userPreferences.bankBalance;

    if (transaction.paymentMethod === "cash") {
      newCashBalance =
        transaction.type === "income"
          ? newCashBalance - transaction.amount
          : newCashBalance + transaction.amount;
    } else {
      newBankBalance =
        transaction.type === "income"
          ? newBankBalance - transaction.amount
          : newBankBalance + transaction.amount;
    }

    // Update balances
    await UserPreference.findOneAndUpdate(
      { user: authPayload.id },
      {
        $set: {
          cashBalance: newCashBalance,
          bankBalance: newBankBalance,
        },
      }
    );

    // Delete transaction
    await Transaction.findOneAndDelete({
      _id: id,
      user: authPayload.id,
    });

    return NextResponse.json({
      message: "Transaction deleted successfully",
      balances: {
        cashBalance: newCashBalance,
        bankBalance: newBankBalance,
      },
    });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return NextResponse.json(
      { message: "Error deleting transaction" },
      { status: 500 }
    );
  }
}
