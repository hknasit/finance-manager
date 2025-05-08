/* eslint-disable @typescript-eslint/no-unused-vars */
// contexts/UserPreferencesContext.tsx
"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";

interface UserPreferences {
  currency: string;
  cashBalance: number;
  bankBalance: number;
  defaultTransactionType: "income" | "expense";
  defaultPaymentMethod: "card" | "cash";
}


interface CurrencyFormat {
  symbol: string;
  position: "before" | "after" | "code";
  decimalPlaces?: number;
  thousandsSeparator?: string;
  decimalSeparator?: string;
}

interface UserPreferencesContextType {
  preferences: UserPreferences;
  setPreferences: (any) => void;
  loading: boolean;
  error: string | null;
  formatAmount: (amount: number) => string;
  getCurrencySymbol: () => string;
  updatePreferences: (
    newPreferences: Partial<UserPreferences>
  ) => Promise<void>;
  refreshPreferences: () => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  currency: "USD",
  cashBalance: 0,
  bankBalance: 0,
  defaultTransactionType: "expense",
  defaultPaymentMethod: "card",
};

// World currencies list with ISO 4217 codes
export const AVAILABLE_CURRENCIES = [
  { code: "AED", name: "United Arab Emirates Dirham" },
  { code: "AFN", name: "Afghan Afghani" },
  { code: "ALL", name: "Albanian Lek" },
  { code: "AMD", name: "Armenian Dram" },
  { code: "ANG", name: "Netherlands Antillean Guilder" },
  { code: "AOA", name: "Angolan Kwanza" },
  { code: "ARS", name: "Argentine Peso" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "AWG", name: "Aruban Florin" },
  { code: "AZN", name: "Azerbaijani Manat" },
  { code: "BAM", name: "Bosnia-Herzegovina Convertible Mark" },
  { code: "BBD", name: "Barbadian Dollar" },
  { code: "BDT", name: "Bangladeshi Taka" },
  { code: "BGN", name: "Bulgarian Lev" },
  { code: "BHD", name: "Bahraini Dinar" },
  { code: "BIF", name: "Burundian Franc" },
  { code: "BMD", name: "Bermudan Dollar" },
  { code: "BND", name: "Brunei Dollar" },
  { code: "BOB", name: "Bolivian Boliviano" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "BSD", name: "Bahamian Dollar" },
  { code: "BTC", name: "Bitcoin" },
  { code: "BTN", name: "Bhutanese Ngultrum" },
  { code: "BWP", name: "Botswanan Pula" },
  { code: "BYN", name: "Belarusian Ruble" },
  { code: "BZD", name: "Belize Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "CDF", name: "Congolese Franc" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "CLF", name: "Chilean Unit of Account (UF)" },
  { code: "CLP", name: "Chilean Peso" },
  { code: "CNH", name: "Chinese Yuan (Offshore)" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "COP", name: "Colombian Peso" },
  { code: "CRC", name: "Costa Rican Colón" },
  { code: "CUC", name: "Cuban Convertible Peso" },
  { code: "CUP", name: "Cuban Peso" },
  { code: "CVE", name: "Cape Verdean Escudo" },
  { code: "CZK", name: "Czech Republic Koruna" },
  { code: "DJF", name: "Djiboutian Franc" },
  { code: "DKK", name: "Danish Krone" },
  { code: "DOP", name: "Dominican Peso" },
  { code: "DZD", name: "Algerian Dinar" },
  { code: "EGP", name: "Egyptian Pound" },
  { code: "ERN", name: "Eritrean Nakfa" },
  { code: "ETB", name: "Ethiopian Birr" },
  { code: "EUR", name: "Euro" },
  { code: "FJD", name: "Fijian Dollar" },
  { code: "FKP", name: "Falkland Islands Pound" },
  { code: "GBP", name: "British Pound Sterling" },
  { code: "GEL", name: "Georgian Lari" },
  { code: "GGP", name: "Guernsey Pound" },
  { code: "GHS", name: "Ghanaian Cedi" },
  { code: "GIP", name: "Gibraltar Pound" },
  { code: "GMD", name: "Gambian Dalasi" },
  { code: "GNF", name: "Guinean Franc" },
  { code: "GTQ", name: "Guatemalan Quetzal" },
  { code: "GYD", name: "Guyanaese Dollar" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "HNL", name: "Honduran Lempira" },
  { code: "HRK", name: "Croatian Kuna" },
  { code: "HTG", name: "Haitian Gourde" },
  { code: "HUF", name: "Hungarian Forint" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "ILS", name: "Israeli New Shekel" },
  { code: "IMP", name: "Manx pound" },
  { code: "INR", name: "Indian Rupee" },
  { code: "IQD", name: "Iraqi Dinar" },
  { code: "IRR", name: "Iranian Rial" },
  { code: "ISK", name: "Icelandic Króna" },
  { code: "JEP", name: "Jersey Pound" },
  { code: "JMD", name: "Jamaican Dollar" },
  { code: "JOD", name: "Jordanian Dinar" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "KES", name: "Kenyan Shilling" },
  { code: "KGS", name: "Kyrgystani Som" },
  { code: "KHR", name: "Cambodian Riel" },
  { code: "KMF", name: "Comorian Franc" },
  { code: "KPW", name: "North Korean Won" },
  { code: "KRW", name: "South Korean Won" },
  { code: "KWD", name: "Kuwaiti Dinar" },
  { code: "KYD", name: "Cayman Islands Dollar" },
  { code: "KZT", name: "Kazakhstani Tenge" },
  { code: "LAK", name: "Laotian Kip" },
  { code: "LBP", name: "Lebanese Pound" },
  { code: "LKR", name: "Sri Lankan Rupee" },
  { code: "LRD", name: "Liberian Dollar" },
  { code: "LSL", name: "Lesotho Loti" },
  { code: "LYD", name: "Libyan Dinar" },
  { code: "MAD", name: "Moroccan Dirham" },
  { code: "MDL", name: "Moldovan Leu" },
  { code: "MGA", name: "Malagasy Ariary" },
  { code: "MKD", name: "Macedonian Denar" },
  { code: "MMK", name: "Myanma Kyat" },
  { code: "MNT", name: "Mongolian Tugrik" },
  { code: "MOP", name: "Macanese Pataca" },
  { code: "MRU", name: "Mauritanian Ouguiya" },
  { code: "MUR", name: "Mauritian Rupee" },
  { code: "MVR", name: "Maldivian Rufiyaa" },
  { code: "MWK", name: "Malawian Kwacha" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "MZN", name: "Mozambican Metical" },
  { code: "NAD", name: "Namibian Dollar" },
  { code: "NGN", name: "Nigerian Naira" },
  { code: "NIO", name: "Nicaraguan Córdoba" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "NPR", name: "Nepalese Rupee" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "OMR", name: "Omani Rial" },
  { code: "PAB", name: "Panamanian Balboa" },
  { code: "PEN", name: "Peruvian Nuevo Sol" },
  { code: "PGK", name: "Papua New Guinean Kina" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "PLN", name: "Polish Złoty" },
  { code: "PYG", name: "Paraguayan Guarani" },
  { code: "QAR", name: "Qatari Rial" },
  { code: "RON", name: "Romanian Leu" },
  { code: "RSD", name: "Serbian Dinar" },
  { code: "RUB", name: "Russian Ruble" },
  { code: "RWF", name: "Rwandan Franc" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "SBD", name: "Solomon Islands Dollar" },
  { code: "SCR", name: "Seychellois Rupee" },
  { code: "SDG", name: "Sudanese Pound" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "SHP", name: "Saint Helena Pound" },
  { code: "SLL", name: "Sierra Leonean Leone" },
  { code: "SOS", name: "Somali Shilling" },
  { code: "SRD", name: "Surinamese Dollar" },
  { code: "SSP", name: "South Sudanese Pound" },
  { code: "STN", name: "São Tomé and Príncipe Dobra" },
  { code: "SVC", name: "Salvadoran Colón" },
  { code: "SYP", name: "Syrian Pound" },
  { code: "SZL", name: "Swazi Lilangeni" },
  { code: "THB", name: "Thai Baht" },
  { code: "TJS", name: "Tajikistani Somoni" },
  { code: "TMT", name: "Turkmenistani Manat" },
  { code: "TND", name: "Tunisian Dinar" },
  { code: "TOP", name: "Tongan Paʻanga" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "TTD", name: "Trinidad and Tobago Dollar" },
  { code: "TWD", name: "New Taiwan Dollar" },
  { code: "TZS", name: "Tanzanian Shilling" },
  { code: "UAH", name: "Ukrainian Hryvnia" },
  { code: "UGX", name: "Ugandan Shilling" },
  { code: "USD", name: "United States Dollar" },
  { code: "UYU", name: "Uruguayan Peso" },
  { code: "UZS", name: "Uzbekistan Som" },
  { code: "VES", name: "Venezuelan Bolívar Soberano" },
  { code: "VND", name: "Vietnamese Dong" },
  { code: "VUV", name: "Vanuatu Vatu" },
  { code: "WST", name: "Samoan Tala" },
  { code: "XAF", name: "CFA Franc BEAC" },
  { code: "XAG", name: "Silver Ounce" },
  { code: "XAU", name: "Gold Ounce" },
  { code: "XCD", name: "East Caribbean Dollar" },
  { code: "XDR", name: "Special Drawing Rights" },
  { code: "XOF", name: "CFA Franc BCEAO" },
  { code: "XPD", name: "Palladium Ounce" },
  { code: "XPF", name: "CFP Franc" },
  { code: "XPT", name: "Platinum Ounce" },
  { code: "YER", name: "Yemeni Rial" },
  { code: "ZAR", name: "South African Rand" },
  { code: "ZMW", name: "Zambian Kwacha" },
  { code: "ZWL", name: "Zimbabwean Dollar" }
];


export const currencyFormats: Record<string, CurrencyFormat> = {
  AED: { symbol: "د.إ", position: "before", decimalPlaces: 2 },
  AFN: { symbol: "؋", position: "after", decimalPlaces: 2 },
  ALL: { symbol: "L", position: "before", decimalPlaces: 2 },
  AMD: { symbol: "֏", position: "after", decimalPlaces: 2 },
  ANG: { symbol: "ƒ", position: "before", decimalPlaces: 2 },
  AOA: { symbol: "Kz", position: "before", decimalPlaces: 2 },
  ARS: { symbol: "$", position: "before", decimalPlaces: 2 },
  AUD: { symbol: "$", position: "before", decimalPlaces: 2 },
  AWG: { symbol: "ƒ", position: "before", decimalPlaces: 2 },
  AZN: { symbol: "₼", position: "before", decimalPlaces: 2 },
  BAM: { symbol: "KM", position: "before", decimalPlaces: 2 },
  BBD: { symbol: "$", position: "before", decimalPlaces: 2 },
  BDT: { symbol: "৳", position: "before", decimalPlaces: 2 },
  BGN: { symbol: "лв", position: "before", decimalPlaces: 2 },
  BHD: { symbol: ".د.ب", position: "after", decimalPlaces: 3 },
  BIF: { symbol: "FBu", position: "after", decimalPlaces: 0 },
  BMD: { symbol: "$", position: "before", decimalPlaces: 2 },
  BND: { symbol: "$", position: "before", decimalPlaces: 2 },
  BOB: { symbol: "Bs.", position: "before", decimalPlaces: 2 },
  BRL: { symbol: "R$", position: "before", decimalPlaces: 2 },
  BSD: { symbol: "$", position: "before", decimalPlaces: 2 },
  BTC: { symbol: "₿", position: "before", decimalPlaces: 8 },
  BTN: { symbol: "Nu.", position: "before", decimalPlaces: 2 },
  BWP: { symbol: "P", position: "before", decimalPlaces: 2 },
  BYN: { symbol: "Br", position: "before", decimalPlaces: 2 },
  BZD: { symbol: "BZ$", position: "before", decimalPlaces: 2 },
  CAD: { symbol: "$", position: "before", decimalPlaces: 2 },
  CDF: { symbol: "FC", position: "after", decimalPlaces: 2 },
  CHF: { symbol: "CHF", position: "before", decimalPlaces: 2 },
  CLF: { symbol: "UF", position: "after", decimalPlaces: 4 },
  CLP: { symbol: "$", position: "before", decimalPlaces: 0 },
  CNH: { symbol: "¥", position: "before", decimalPlaces: 2 },
  CNY: { symbol: "¥", position: "before", decimalPlaces: 2 },
  COP: { symbol: "$", position: "before", decimalPlaces: 2 },
  CRC: { symbol: "₡", position: "before", decimalPlaces: 2 },
  CUC: { symbol: "$", position: "before", decimalPlaces: 2 },
  CUP: { symbol: "₱", position: "before", decimalPlaces: 2 },
  CVE: { symbol: "$", position: "after", decimalPlaces: 2 },
  CZK: { symbol: "Kč", position: "after", decimalPlaces: 2 },
  DJF: { symbol: "Fdj", position: "after", decimalPlaces: 0 },
  DKK: { symbol: "kr", position: "after", decimalPlaces: 2 },
  DOP: { symbol: "RD$", position: "before", decimalPlaces: 2 },
  DZD: { symbol: "د.ج", position: "after", decimalPlaces: 2 },
  EGP: { symbol: "£", position: "before", decimalPlaces: 2 },
  ERN: { symbol: "Nfk", position: "after", decimalPlaces: 2 },
  ETB: { symbol: "Br", position: "before", decimalPlaces: 2 },
  EUR: { symbol: "€", position: "before", decimalPlaces: 2 },
  FJD: { symbol: "$", position: "before", decimalPlaces: 2 },
  FKP: { symbol: "£", position: "before", decimalPlaces: 2 },
  GBP: { symbol: "£", position: "before", decimalPlaces: 2 },
  GEL: { symbol: "₾", position: "before", decimalPlaces: 2 },
  GGP: { symbol: "£", position: "before", decimalPlaces: 2 },
  GHS: { symbol: "₵", position: "before", decimalPlaces: 2 },
  GIP: { symbol: "£", position: "before", decimalPlaces: 2 },
  GMD: { symbol: "D", position: "before", decimalPlaces: 2 },
  GNF: { symbol: "FG", position: "after", decimalPlaces: 0 },
  GTQ: { symbol: "Q", position: "before", decimalPlaces: 2 },
  GYD: { symbol: "$", position: "before", decimalPlaces: 2 },
  HKD: { symbol: "$", position: "before", decimalPlaces: 2 },
  HNL: { symbol: "L", position: "before", decimalPlaces: 2 },
  HRK: { symbol: "kn", position: "after", decimalPlaces: 2 },
  HTG: { symbol: "G", position: "before", decimalPlaces: 2 },
  HUF: { symbol: "Ft", position: "after", decimalPlaces: 0 },
  IDR: { symbol: "Rp", position: "before", decimalPlaces: 0 },
  ILS: { symbol: "₪", position: "before", decimalPlaces: 2 },
  IMP: { symbol: "£", position: "before", decimalPlaces: 2 },
  INR: { symbol: "₹", position: "before", decimalPlaces: 2 },
  IQD: { symbol: "ع.د", position: "after", decimalPlaces: 3 },
  IRR: { symbol: "﷼", position: "after", decimalPlaces: 2 },
  ISK: { symbol: "kr", position: "after", decimalPlaces: 0 },
  JEP: { symbol: "£", position: "before", decimalPlaces: 2 },
  JMD: { symbol: "J$", position: "before", decimalPlaces: 2 },
  JOD: { symbol: "د.ا", position: "after", decimalPlaces: 3 },
  JPY: { symbol: "¥", position: "before", decimalPlaces: 0 },
  KES: { symbol: "KSh", position: "before", decimalPlaces: 2 },
  KGS: { symbol: "сом", position: "after", decimalPlaces: 2 },
  KHR: { symbol: "៛", position: "after", decimalPlaces: 2 },
  KMF: { symbol: "CF", position: "after", decimalPlaces: 0 },
  KPW: { symbol: "₩", position: "before", decimalPlaces: 2 },
  KRW: { symbol: "₩", position: "before", decimalPlaces: 0 },
  KWD: { symbol: "د.ك", position: "after", decimalPlaces: 3 },
  KYD: { symbol: "$", position: "before", decimalPlaces: 2 },
  KZT: { symbol: "₸", position: "before", decimalPlaces: 2 },
  LAK: { symbol: "₭", position: "before", decimalPlaces: 2 },
  LBP: { symbol: "ل.ل", position: "before", decimalPlaces: 2 },
  LKR: { symbol: "₨", position: "before", decimalPlaces: 2 },
  LRD: { symbol: "$", position: "before", decimalPlaces: 2 },
  LSL: { symbol: "L", position: "before", decimalPlaces: 2 },
  LYD: { symbol: "ل.د", position: "after", decimalPlaces: 3 },
  MAD: { symbol: "د.م.", position: "after", decimalPlaces: 2 },
  MDL: { symbol: "L", position: "after", decimalPlaces: 2 },
  MGA: { symbol: "Ar", position: "before", decimalPlaces: 2 },
  MKD: { symbol: "ден", position: "after", decimalPlaces: 2 },
  MMK: { symbol: "K", position: "before", decimalPlaces: 2 },
  MNT: { symbol: "₮", position: "before", decimalPlaces: 2 },
  MOP: { symbol: "MOP$", position: "before", decimalPlaces: 2 },
  MRU: { symbol: "UM", position: "after", decimalPlaces: 2 },
  MUR: { symbol: "₨", position: "before", decimalPlaces: 2 },
  MVR: { symbol: "Rf", position: "before", decimalPlaces: 2 },
  MWK: { symbol: "MK", position: "before", decimalPlaces: 2 },
  MXN: { symbol: "$", position: "before", decimalPlaces: 2 },
  MYR: { symbol: "RM", position: "before", decimalPlaces: 2 },
  MZN: { symbol: "MT", position: "before", decimalPlaces: 2 },
  NAD: { symbol: "$", position: "before", decimalPlaces: 2 },
  NGN: { symbol: "₦", position: "before", decimalPlaces: 2 },
  NIO: { symbol: "C$", position: "before", decimalPlaces: 2 },
  NOK: { symbol: "kr", position: "after", decimalPlaces: 2 },
  NPR: { symbol: "₨", position: "before", decimalPlaces: 2 },
  NZD: { symbol: "$", position: "before", decimalPlaces: 2 },
  OMR: { symbol: "ر.ع.", position: "after", decimalPlaces: 3 },
  PAB: { symbol: "B/.", position: "before", decimalPlaces: 2 },
  PEN: { symbol: "S/", position: "before", decimalPlaces: 2 },
  PGK: { symbol: "K", position: "before", decimalPlaces: 2 },
  PHP: { symbol: "₱", position: "before", decimalPlaces: 2 },
  PKR: { symbol: "₨", position: "before", decimalPlaces: 2 },
  PLN: { symbol: "zł", position: "after", decimalPlaces: 2 },
  PYG: { symbol: "₲", position: "before", decimalPlaces: 0 },
  QAR: { symbol: "ر.ق", position: "after", decimalPlaces: 2 },
  RON: { symbol: "lei", position: "after", decimalPlaces: 2 },
  RSD: { symbol: "дин.", position: "after", decimalPlaces: 2 },
  RUB: { symbol: "₽", position: "after", decimalPlaces: 2 },
  RWF: { symbol: "FRw", position: "after", decimalPlaces: 0 },
  SAR: { symbol: "ر.س", position: "after", decimalPlaces: 2 },
  SBD: { symbol: "$", position: "before", decimalPlaces: 2 },
  SCR: { symbol: "₨", position: "before", decimalPlaces: 2 },
  SDG: { symbol: "ج.س.", position: "after", decimalPlaces: 2 },
  SEK: { symbol: "kr", position: "after", decimalPlaces: 2 },
  SGD: { symbol: "$", position: "before", decimalPlaces: 2 },
  SHP: { symbol: "£", position: "before", decimalPlaces: 2 },
  SLL: { symbol: "Le", position: "before", decimalPlaces: 2 },
  SOS: { symbol: "S", position: "before", decimalPlaces: 2 },
  SRD: { symbol: "$", position: "before", decimalPlaces: 2 },
  SSP: { symbol: "£", position: "before", decimalPlaces: 2 },
  STN: { symbol: "Db", position: "before", decimalPlaces: 2 },
  SVC: { symbol: "₡", position: "before", decimalPlaces: 2 },
  SYP: { symbol: "£", position: "before", decimalPlaces: 2 },
  SZL: { symbol: "L", position: "before", decimalPlaces: 2 },
  THB: { symbol: "฿", position: "before", decimalPlaces: 2 },
  TJS: { symbol: "ЅМ", position: "after", decimalPlaces: 2 },
  TMT: { symbol: "m", position: "after", decimalPlaces: 2 },
  TND: { symbol: "د.ت", position: "after", decimalPlaces: 3 },
  TOP: { symbol: "T$", position: "before", decimalPlaces: 2 },
  TRY: { symbol: "₺", position: "before", decimalPlaces: 2 },
  TTD: { symbol: "TT$", position: "before", decimalPlaces: 2 },
  TWD: { symbol: "NT$", position: "before", decimalPlaces: 2 },
  TZS: { symbol: "TSh", position: "before", decimalPlaces: 2 },
  UAH: { symbol: "₴", position: "after", decimalPlaces: 2 },
  UGX: { symbol: "USh", position: "before", decimalPlaces: 0 },
  USD: { symbol: "$", position: "before", decimalPlaces: 2 },
  UYU: { symbol: "$U", position: "before", decimalPlaces: 2 },
  UZS: { symbol: "сўм", position: "after", decimalPlaces: 2 },
  VES: { symbol: "Bs.S", position: "before", decimalPlaces: 2 },
  VND: { symbol: "₫", position: "after", decimalPlaces: 0 },
  VUV: { symbol: "VT", position: "before", decimalPlaces: 0 },
  WST: { symbol: "WS$", position: "before", decimalPlaces: 2 },
  XAF: { symbol: "FCFA", position: "before", decimalPlaces: 0 },
  XAG: { symbol: "oz t", position: "after", decimalPlaces: 2 },
  XAU: { symbol: "oz t", position: "after", decimalPlaces: 2 },
  XCD: { symbol: "EC$", position: "before", decimalPlaces: 2 },
  XDR: { symbol: "SDR", position: "after", decimalPlaces: 2 },
  XOF: { symbol: "CFA", position: "after", decimalPlaces: 0 },
  XPD: { symbol: "oz t", position: "after", decimalPlaces: 2 },
  XPF: { symbol: "CFP", position: "after", decimalPlaces: 0 },
  XPT: { symbol: "oz t", position: "after", decimalPlaces: 2 },
  YER: { symbol: "﷼", position: "after", decimalPlaces: 2 },
  ZAR: { symbol: "R", position: "before", decimalPlaces: 2 },
  ZMW: { symbol: "ZK", position: "before", decimalPlaces: 2 },
  ZWL: { symbol: "$", position: "before", decimalPlaces: 2 }
};

const UserPreferencesContext = createContext<
  UserPreferencesContextType | undefined
>(undefined);

export function UserPreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const [preferences, setPreferences] =
    useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  const formatAmount = useCallback(
    (amount: number): string => {
      const format = currencyFormats[preferences.currency] || currencyFormats.USD;
      
      // Use the currency-specific decimal places
      const decimalPlaces = format.decimalPlaces !== undefined ? format.decimalPlaces : 2;
      
      // Format the number with the appropriate decimal places
      const formattedNumber = amount.toLocaleString('en-US', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      });
      
      // Apply the currency symbol in the correct position with proper spacing
      if (format.position === "before") {
        return `${format.symbol}${formattedNumber}`;
      } else if (format.position === "after") {
        return `${formattedNumber} ${format.symbol}`;
      } else {
        // Default to currency code format if position is not recognized
        return `${formattedNumber} ${preferences.currency}`;
      }
    },
    [preferences.currency]
  );

  const getCurrencySymbol = useCallback((): string => {
    return currencyFormats[preferences.currency]?.symbol || "$";
  }, [preferences.currency]);

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/user/profile`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch preferences");
      }

      const data = await response.json();
      setPreferences((prev) => ({
        ...prev,
        currency: data.currency || prev.currency,
        cashBalance: data.cashBalance ?? prev.cashBalance,
        bankBalance: data.bankBalance ?? prev.bankBalance,
        defaultTransactionType:
          data.defaultTransactionType || prev.defaultTransactionType,
        defaultPaymentMethod:
          data.defaultPaymentMethod || prev.defaultPaymentMethod,
      }));
      setLastUpdate(Date.now());
    } catch (err) {
      console.error("Error fetching preferences:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch preferences"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = async (
    newPreferences: Partial<UserPreferences>
  ) => {
    try {
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_PATH}/api/user/profile`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...preferences,
            ...newPreferences,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update preferences");
      }

      const data = await response.json();
      setPreferences((prev) => ({
        ...prev,
        ...newPreferences,
      }));
      setLastUpdate(Date.now());

      // Force refresh all components using preferences
      window.dispatchEvent(new Event("preferencesUpdated"));

      return data;
    } catch (err) {
      console.error("Error updating preferences:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update preferences"
      );
      throw err;
    }
  };

  const refreshPreferences = async () => {
    if (isAuthenticated) {
      await fetchPreferences();
    }
  };

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchPreferences();
    }
  }, [isAuthenticated, fetchPreferences]);

  // Listen for preference updates from other components
  useEffect(() => {
    const handlePreferencesUpdate = () => {
      fetchPreferences();
    };

    window.addEventListener("preferencesUpdated", handlePreferencesUpdate);

    return () => {
      window.removeEventListener("preferencesUpdated", handlePreferencesUpdate);
    };
  }, [fetchPreferences]);

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        setPreferences,
        loading,
        error,
        formatAmount,
        getCurrencySymbol,
        updatePreferences,
        refreshPreferences,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error(
      "useUserPreferences must be used within a UserPreferencesProvider"
    );
  }
  return context;
};
