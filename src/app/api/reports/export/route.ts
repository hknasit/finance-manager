/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/reports/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Transaction from "@/models/transaction.model";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import * as XLSX from 'xlsx';
// import { verifyAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get and verify auth token
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { startDate, endDate, type, categories, paymentMethod } = body;

    // Build query
    const query: any = {
      user: new mongoose.Types.ObjectId(decoded.id),
      date: { $gte: new Date(startDate), $lte: new Date(endDate) }
    };

    if (type && type !== 'all') query.type = type;
    if (categories && categories.length > 0) query.category = { $in: categories };
    if (paymentMethod && paymentMethod !== 'all') query.paymentMethod = paymentMethod;

    const transactions = await Transaction.find(query)
      .select('type category amount description date paymentMethod -_id')
      .lean();

    // Prepare data for Excel
    const excelData = transactions.map(t => ({
      Date: new Date(t.date).toLocaleDateString(),
      Type: t.type.charAt(0).toUpperCase() + t.type.slice(1),
      Category: t.category,
      Description: t.description,
      Amount: t.amount,
      'Payment Method': t.paymentMethod.toUpperCase()
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Add autofilter to header row
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    ws['!autofilter'] = { ref: `A1:${XLSX.utils.encode_col(range.e.c)}1` };

    // Style the header row
    const headerStyle = {
      fill: { fgColor: { rgb: "FFE6E6E6" } },
      font: { bold: true },
      alignment: { horizontal: "center" }
    };

    // Apply styles to header row
    const headers = Object.keys(excelData[0] || {});
    headers.forEach((header, idx) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: idx });
      ws[cellRef].s = headerStyle;
    });

    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      headers: {
        'Content-Disposition': `attachment; filename="transactions-${startDate}-to-${endDate}.xlsx"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });

  } catch (error) {
    console.error("Error in export:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}