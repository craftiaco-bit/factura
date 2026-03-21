export type InvoiceType = 'contado' | 'credito';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  type: InvoiceType;
  date: string;

  // Client
  clientName: string;
  clientDocument: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;

  // Product
  productSlug: string;
  productName: string;
  productImage: string;
  productColor: string;
  productYear: number;

  // Line items
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;

  // Credit-specific fields
  initialPayment: number;
  financedAmount: number;
  installments: number;
  monthlyPayment: number;
  financingEntity: string;

  // Advisor
  advisorName: string;
  advisorPhone: string;
  advisorEmail: string;

  createdAt: string;
}
