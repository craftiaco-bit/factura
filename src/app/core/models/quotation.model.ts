export type QuotationPaymentType = 'contado' | 'credito';

export interface QuotationFeature {
  icon: string;
  label: string;
}

export interface Quotation {
  id: string;
  number: string;
  paymentType: QuotationPaymentType;
  date: string;
  validUntil: string;
  clientName: string;
  productSlug: string;
  productName: string;
  productImage: string;
  productColor: string;
  productYear: number;
  specifications: Record<string, string>;
  benefits: string[];
  features: QuotationFeature[];
  accentColor: string;
  accentDark: string;
  category: string;
  priceWithTax: number;
  soatValue: number;
  helmetValue: number;
  accessoriesValue: number;
  registrationValue: number;
  insuranceValue: number;
  quantity: number;
  total: number;
  advisorName: string;
  advisorPhone: string;
  advisorEmail: string;
  advisorAddress: string;
  createdAt: string;
}
