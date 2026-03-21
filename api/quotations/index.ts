import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const rows = await sql('SELECT * FROM quotations ORDER BY created_at DESC');
    const quotations = rows.map(toQuotation);
    return res.status(200).json(quotations);
  }

  if (req.method === 'POST') {
    const d = req.body;
    await sql(
      `INSERT INTO quotations (id, number, payment_type, date, valid_until, client_name,
        product_slug, product_name, product_image, product_color, product_year,
        specifications, benefits, features, accent_color, accent_dark, category,
        price_with_tax, soat_value, helmet_value, accessories_value, registration_value, insurance_value,
        quantity, total, advisor_name, advisor_phone, advisor_email, advisor_address, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30)
       ON CONFLICT (id) DO UPDATE SET
        number=$2, payment_type=$3, date=$4, valid_until=$5, client_name=$6,
        product_slug=$7, product_name=$8, product_image=$9, product_color=$10, product_year=$11,
        specifications=$12, benefits=$13, features=$14, accent_color=$15, accent_dark=$16, category=$17,
        price_with_tax=$18, soat_value=$19, helmet_value=$20, accessories_value=$21, registration_value=$22, insurance_value=$23,
        quantity=$24, total=$25, advisor_name=$26, advisor_phone=$27, advisor_email=$28, advisor_address=$29`,
      [
        d.id, d.number, d.paymentType, d.date, d.validUntil, d.clientName,
        d.productSlug, d.productName, d.productImage, d.productColor, d.productYear,
        JSON.stringify(d.specifications ?? {}), JSON.stringify(d.benefits ?? []), JSON.stringify(d.features ?? []),
        d.accentColor, d.accentDark, d.category,
        d.priceWithTax, d.soatValue, d.helmetValue, d.accessoriesValue, d.registrationValue, d.insuranceValue,
        d.quantity, d.total, d.advisorName, d.advisorPhone, d.advisorEmail, d.advisorAddress, d.createdAt,
      ]
    );
    return res.status(200).json(d);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function toQuotation(r: Record<string, unknown>) {
  return {
    id: r.id,
    number: r.number,
    paymentType: r.payment_type,
    date: r.date,
    validUntil: r.valid_until,
    clientName: r.client_name,
    productSlug: r.product_slug,
    productName: r.product_name,
    productImage: r.product_image,
    productColor: r.product_color,
    productYear: r.product_year,
    specifications: typeof r.specifications === 'string' ? JSON.parse(r.specifications) : r.specifications,
    benefits: typeof r.benefits === 'string' ? JSON.parse(r.benefits) : r.benefits,
    features: typeof r.features === 'string' ? JSON.parse(r.features) : r.features,
    accentColor: r.accent_color,
    accentDark: r.accent_dark,
    category: r.category,
    priceWithTax: Number(r.price_with_tax),
    soatValue: Number(r.soat_value),
    helmetValue: Number(r.helmet_value),
    accessoriesValue: Number(r.accessories_value),
    registrationValue: Number(r.registration_value),
    insuranceValue: Number(r.insurance_value),
    quantity: Number(r.quantity),
    total: Number(r.total),
    advisorName: r.advisor_name,
    advisorPhone: r.advisor_phone,
    advisorEmail: r.advisor_email,
    advisorAddress: r.advisor_address,
    createdAt: r.created_at,
  };
}
