/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * API route for exporting transaction data to Excel format
 * app/api/reports/export/route.ts
 */
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Transaction from "@/models/transaction.model";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import * as XLSX from "xlsx";
import { Transaction as ITransaction } from "@/types/transaction";

// Constants
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const HEADER_STYLE = {
  fill: { patternType: "solid", fgColor: { rgb: "E6E6E6" } },
  font: { bold: true },
  alignment: { horizontal: "center" }
};

const MIN_COLUMN_WIDTH = 10;
const DATE_COLUMN_WIDTH = 12;
const DESCRIPTION_COLUMN_WIDTH = 15;

/**
 * Formats a date into a string like "01 January 2023"
 */
function formatDate(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = MONTH_NAMES[date.getUTCMonth()];
  const year = date.getUTCFullYear();

  return `${day} ${month} ${year}`;
}


/**
 * Transform transaction data for Excel export
 */
function prepareExcelData(transactions: ITransaction[]): Record<string, any>[] {

  return transactions.map((t: ITransaction) => {
    
    return{
    Date: formatDate(new Date(t.date)),
    Type: t.type.charAt(0).toUpperCase() + t.type.slice(1),
    Category: t.category,
    Description: t.description,
    Image: t.image ? { f: `HYPERLINK("${t.image.url}","View Receipt")` } : "",
    Amount: t.amount,
    'Payment Method': t.paymentMethod.toUpperCase()
  }});
}

/**
 * Auto-sizes worksheet columns based on content
 */
function autoSizeColumns(worksheet: XLSX.WorkSheet): void {
  const columnNames = Object.keys(worksheet)
    .filter(key => key.charAt(0) !== '!')
    .map(key => key.replace(/[0-9]/g, ''))
    .filter((value, index, self) => self.indexOf(value) === index);
  
  if (!worksheet['!cols']) worksheet['!cols'] = [];
  
  columnNames.forEach(col => {
    let maxWidth = MIN_COLUMN_WIDTH;
    
    const columnCells = Object.keys(worksheet)
      .filter(key => key.charAt(0) !== '!' && key.replace(/[0-9]/g, '') === col);
    
    columnCells.forEach(cellRef => {
      const cell = worksheet[cellRef];
      if (!cell) return;
      
      let cellText = '';
      
      if (cell.v !== undefined) {
        cellText = String(cell.v);
      } else if (cell.f !== undefined && cell.f.startsWith('HYPERLINK')) {
        const matches = cell.f.match(/HYPERLINK\("[^"]+","([^"]+)"\)/);
        if (matches && matches[1]) {
          cellText = matches[1];
        }
      }
      
      const colIndex = XLSX.utils.decode_col(col);
      const baseWidth = colIndex === 0 ? DATE_COLUMN_WIDTH :
                        colIndex === 3 ? DESCRIPTION_COLUMN_WIDTH :
                        MIN_COLUMN_WIDTH;
      
      const cellWidth = Math.max(cellText.length, baseWidth);
      maxWidth = Math.max(maxWidth, cellWidth);
    });
    
    const colIndex = XLSX.utils.decode_col(col);
    worksheet['!cols'][colIndex] = { width: maxWidth + 2 };
  });
}

/**
 * Apply styles to the header row
 */
function styleHeaderRow(worksheet: XLSX.WorkSheet, headers: string[]): void {
  headers.forEach((header, idx) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: idx });
    if (!worksheet[cellRef].s) worksheet[cellRef].s = {};
    worksheet[cellRef].s = HEADER_STYLE;
  });
}

/**
 * Generates Excel file from transaction data
 */
function generateExcelFile(excelData: Record<string, any>[]): Buffer {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData, { cellStyles: true });

  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  ws['!autofilter'] = { ref: `A1:${XLSX.utils.encode_col(range.e.c)}1` };
  
  autoSizeColumns(ws);
  styleHeaderRow(ws, Object.keys(excelData[0] || {}));

  XLSX.utils.book_append_sheet(wb, ws, "Transactions");

  return XLSX.write(wb, { 
    type: 'buffer', 
    bookType: 'xlsx', 
    cellStyles: true
  });
}

/**
 * Handles POST requests to export transaction data to Excel
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication
    const cookieStore = cookies();
    const token = (await cookieStore).get("auth-token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      userId = decoded.id;
    } catch (err:any) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { startDate, endDate, type, categories, paymentMethod } = body;
    const startOfDay = new Date(startDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(endDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Build query
    const query: Record<string, any> = {
      user: new mongoose.Types.ObjectId(userId),
      date: { $gte: new Date(startOfDay), $lte: new Date(endOfDay) },
    };

    if (type && type !== "all") query.type = type;
    if (categories && categories.length > 0) query.category = { $in: categories };
    if (paymentMethod && paymentMethod !== "all") query.paymentMethod = paymentMethod;

    const transactions : any = await Transaction.find(query)
      .select("type category amount description date paymentMethod image -_id")
      .lean();

    // Generate Excel file
    const excelData = prepareExcelData(transactions);
    const excelBuffer = generateExcelFile(excelData);

    // Return as downloadable file
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="CashFlow-${startDate}-to-${endDate}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (error) {
    console.error("Error in export:", error);
    return NextResponse.json(
      { error: "Failed to generate report", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}