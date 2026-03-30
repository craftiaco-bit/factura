import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const rows = await sql('SELECT * FROM quotations ORDER BY created_at DESC');
    const quotations = rows.map(toQuotation);
    return res.status(200).json(quotations);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    await sql('DELETE FROM quotations WHERE id = $1', [id]);
    return res.status(200).json({ deleted: true });
  }

  if (req.method === 'POST') {
    const d = req.body;
    await sql(
      `INSERT INTO quotations (id, number, payment_type, date, valid_until, client_name, client_document, client_email, client_address,
        product_slug, product_name, product_image, product_color, product_year,
        specifications, benefits, features, accent_color, accent_dark, category,
        price_with_tax, soat_value, helmet_included, accessories_included, registration_value, insurance_value,
        quantity, total, initial_payment, advisor_name, advisor_document, advisor_phone, advisor_email, advisor_address, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35)
       ON CONFLICT (id) DO UPDATE SET
        number=$2, payment_type=$3, date=$4, valid_until=$5, client_name=$6, client_document=$7, client_email=$8, client_address=$9,
        product_slug=$10, product_name=$11, product_image=$12, product_color=$13, product_year=$14,
        specifications=$15, benefits=$16, features=$17, accent_color=$18, accent_dark=$19, category=$20,
        price_with_tax=$21, soat_value=$22, helmet_included=$23, accessories_included=$24, registration_value=$25, insurance_value=$26,
        quantity=$27, total=$28, initial_payment=$29, advisor_name=$30, advisor_document=$31, advisor_phone=$32, advisor_email=$33, advisor_address=$34`,
      [
        d.id, d.number, d.paymentType, d.date, d.validUntil, d.clientName, d.clientDocument, d.clientEmail, d.clientAddress,
        d.productSlug, d.productName, d.productImage, d.productColor, d.productYear,
        JSON.stringify(d.specifications ?? {}), JSON.stringify(d.benefits ?? []), JSON.stringify(d.features ?? []),
        d.accentColor, d.accentDark, d.category,
        d.priceWithTax, d.soatValue, d.helmetIncluded ?? false, d.accessoriesIncluded ?? false, d.registrationValue, d.insuranceValue,
        d.quantity, d.total, d.initialPayment ?? 0, d.advisorName, d.advisorDocument, d.advisorPhone, d.advisorEmail, d.advisorAddress, d.createdAt,
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
    clientDocument: r.client_document ?? '',
    clientEmail: r.client_email ?? '',
    clientAddress: r.client_address ?? '',
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
    helmetIncluded: r.helmet_included === true || r.helmet_included === 'true',
    accessoriesIncluded: r.accessories_included === true || r.accessories_included === 'true',
    registrationValue: Number(r.registration_value),
    insuranceValue: Number(r.insurance_value),
    quantity: Number(r.quantity),
    total: Number(r.total),
    initialPayment: Number(r.initial_payment ?? 0),
    advisorName: r.advisor_name,
    advisorDocument: r.advisor_document ?? '',
    advisorPhone: r.advisor_phone,
    advisorEmail: r.advisor_email,
    advisorAddress: r.advisor_address,
    createdAt: r.created_at,
  };
}
