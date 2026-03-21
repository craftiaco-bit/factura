import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const rows = await sql('SELECT * FROM invoices ORDER BY created_at DESC');
    const invoices = rows.map(toInvoice);
    return res.status(200).json(invoices);
  }

  if (req.method === 'POST') {
    const d = req.body;
    await sql(
      `INSERT INTO invoices (id, number, type, date, client_name, client_document, client_phone, client_email, client_address,
        product_slug, product_name, product_image, product_color, product_year, items, subtotal, tax, total,
        initial_payment, financed_amount, installments, monthly_payment, financing_entity,
        advisor_name, advisor_phone, advisor_email, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)
       ON CONFLICT (id) DO UPDATE SET
        number=$2, type=$3, date=$4, client_name=$5, client_document=$6, client_phone=$7, client_email=$8, client_address=$9,
        product_slug=$10, product_name=$11, product_image=$12, product_color=$13, product_year=$14, items=$15,
        subtotal=$16, tax=$17, total=$18, initial_payment=$19, financed_amount=$20, installments=$21,
        monthly_payment=$22, financing_entity=$23, advisor_name=$24, advisor_phone=$25, advisor_email=$26`,
      [
        d.id, d.number, d.type, d.date, d.clientName, d.clientDocument, d.clientPhone, d.clientEmail, d.clientAddress,
        d.productSlug, d.productName, d.productImage, d.productColor, d.productYear, JSON.stringify(d.items),
        d.subtotal, d.tax, d.total, d.initialPayment, d.financedAmount, d.installments, d.monthlyPayment,
        d.financingEntity, d.advisorName, d.advisorPhone, d.advisorEmail, d.createdAt,
      ]
    );
    return res.status(200).json(d);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function toInvoice(r: Record<string, unknown>) {
  return {
    id: r.id,
    number: r.number,
    type: r.type,
    date: r.date,
    clientName: r.client_name,
    clientDocument: r.client_document,
    clientPhone: r.client_phone,
    clientEmail: r.client_email,
    clientAddress: r.client_address,
    productSlug: r.product_slug,
    productName: r.product_name,
    productImage: r.product_image,
    productColor: r.product_color,
    productYear: r.product_year,
    items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
    subtotal: Number(r.subtotal),
    tax: Number(r.tax),
    total: Number(r.total),
    initialPayment: Number(r.initial_payment),
    financedAmount: Number(r.financed_amount),
    installments: Number(r.installments),
    monthlyPayment: Number(r.monthly_payment),
    financingEntity: r.financing_entity,
    advisorName: r.advisor_name,
    advisorPhone: r.advisor_phone,
    advisorEmail: r.advisor_email,
    createdAt: r.created_at,
  };
}
