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
  clientDocument: string;
  clientEmail: string;
  clientAddress: string;
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
  helmetIncluded: boolean;
  accessoriesIncluded: boolean;
  registrationValue: number;
  insuranceValue: number;
  quantity: number;
  immediateDeposit: number;
  total: number;
  initialPayment: number;
  installments: number;
  monthlyPayment: number;
  validUntilTime: string;
  advisorName: string;
  advisorDocument: string;
  advisorPhone: string;
  advisorEmail: string;
  advisorAddress: string;
  createdAt: string;
}
