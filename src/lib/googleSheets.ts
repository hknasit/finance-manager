/* eslint-disable @typescript-eslint/no-explicit-any */
import { google } from "googleapis";
import { JWT } from "google-auth-library";

// interface SheetData {
//   values: any[][];
//   range: string;
// }

export class GoogleSheetsService {
  private auth: JWT;
  private sheets: any;
  private drive: any;

  constructor() {
    this.auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file",
      ]
    );

    this.sheets = google.sheets({ version: "v4", auth: this.auth });
    this.drive = google.drive({ version: "v3", auth: this.auth });
  }

  async createNewSpreadsheet(userId: string) {
    try {
      // Create a new spreadsheet
      const spreadsheet = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `Finance Manager - ${userId}`,
          },
          sheets: [
            { properties: { title: "Dashboard" } },
            ...[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map((month) => ({ properties: { title: month } })),
          ],
        },
      });

      const spreadsheetId = spreadsheet.data.spreadsheetId;

      // Initialize all sheets
      await this.initializeDashboard(spreadsheetId);
      await Promise.all(
        [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ].map((month) => this.initializeMonthSheet(spreadsheetId, month))
      );

      // Move to specific folder if needed
      if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
        await this.drive.files.update({
          fileId: spreadsheetId,
          addParents: process.env.GOOGLE_DRIVE_FOLDER_ID,
          fields: "id, parents",
        });
      }

      return spreadsheetId;
    } catch (error) {
      console.error("Error creating spreadsheet:", error);
      throw error;
    }
  }

  private async initializeDashboard(spreadsheetId: string) {
    const headers = [
      [
        "Month",
        "Gross Income",
        "Credit Bill",
        "Donation",
        "Rent",
        "Food",
        "Miscellaneous",
        "Monthly Expense",
        "Net Income",
      ],
    ];

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const formulas = months.map((month, index) => [
      month,
      `='${month}'!$C$2`, // Gross Income
      `='${month}'!$D$2`, // Credit Bill
      `='${month}'!$E$2`, // Donation
      `='${month}'!$F$2`, // Rent
      `='${month}'!$G$2`, // Food
      `='${month}'!$H$2`, // Miscellaneous
      `=SUM(C${index + 2}:G${index + 2})`, // Monthly Expense (will adjust row number in loop)
      `=B${index + 2}-H${index + 2}`, // Net Income (will adjust row number in loop)
    ]);

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Dashboard!A1:I1",
      valueInputOption: "RAW",
      requestBody: { values: headers },
    });

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "Dashboard!A2:I13",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: formulas },
    });
  }

  private async initializeMonthSheet(spreadsheetId: string, month: string) {
    const headers = [
      [
        "Details",
        "Date",
        "Income",
        "Credit Bill",
        "Donation",
        "Rent",
        "Food",
        "Miscellaneous",
      ],
    ];

    const totalsFormulas = [
      [
        "TOTAL",
        "",
        "=SUBTOTAL(9,C3:C1048576)", // Income
        "=SUBTOTAL(9,D3:D1048576)", // Credit Bill
        "=SUBTOTAL(9,E3:E1048576)", // Donation
        "=SUBTOTAL(9,F3:F1048576)", // Rent
        "=SUBTOTAL(9,G3:G1048576)", // Food
        "=SUBTOTAL(9,H3:H1048576)", // Miscellaneous
      ],
    ];

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${month}!A1:H1`,
      valueInputOption: "RAW",
      requestBody: { values: headers },
    });

    await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${month}!A2:H2`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: totalsFormulas },
    });
  }

  async addTransaction(spreadsheetId: string, transaction: any) {
    try {
      const monthName = new Date(transaction.date).toLocaleString("default", {
        month: "long",
      });
      const sheetId = await this.getSheetId(spreadsheetId, monthName);

      // Calculate insert position (after headers and total)
      const insertIndex = 3; // Always insert after headers and total row

      // Prepare the new row data
      const rowData = [
        transaction.description,
        transaction.date,
        transaction.type === "income" ? transaction.amount : null,
        transaction.category === "Credit Bill" ? transaction.amount : null,
        transaction.category === "Donation" ? transaction.amount : null,
        transaction.category === "Rent" ? transaction.amount : null,
        transaction.category === "Food" ? transaction.amount : null,
        transaction.category === "Miscellaneous" ? transaction.amount : null,
      ];

      // Insert the new row using batchUpdate
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              insertDimension: {
                range: {
                  sheetId: sheetId,
                  dimension: "ROWS",
                  startIndex: insertIndex,
                  endIndex: insertIndex + 1,
                },
                inheritFromBefore: false,
              },
            },
          ],
        },
      });

      // Update the cell values
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${monthName}!A${insertIndex + 1}:H${insertIndex + 1}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [rowData],
        },
      });

      // Apply formatting to the new row
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: insertIndex,
                  endRowIndex: insertIndex + 1,
                  startColumnIndex: 0,
                  endColumnIndex: 8,
                },
                cell: {
                  userEnteredFormat: {
                    numberFormat: { type: "NUMBER", pattern: "#,##0.00" },
                  },
                },
                fields: "userEnteredFormat.numberFormat",
              },
            },
          ],
        },
      });
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw error;
    }
  }

  private async getSheetId(
    spreadsheetId: string,
    sheetName: string
  ): Promise<number> {
    const spreadsheet = await this.sheets.spreadsheets.get({
      spreadsheetId,
      fields: "sheets.properties",
    });

    const sheet = spreadsheet.data.sheets.find(
      (s: any) => s.properties.title === sheetName
    );

    if (!sheet) {
      throw new Error(`Sheet ${sheetName} not found`);
    }

    return sheet.properties.sheetId;
  }
  async getSpreadsheetUrl(spreadsheetId: string) {
    const file = await this.drive.files.get({
      fileId: spreadsheetId,
      fields: "webViewLink",
    });
    return file.data.webViewLink;
  }
}
