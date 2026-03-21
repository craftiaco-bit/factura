import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  await sql(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      client_name TEXT NOT NULL DEFAULT '',
      client_document TEXT NOT NULL DEFAULT '',
      client_phone TEXT DEFAULT '',
      client_email TEXT DEFAULT '',
      client_address TEXT DEFAULT '',
      product_slug TEXT NOT NULL DEFAULT '',
      product_name TEXT NOT NULL DEFAULT '',
      product_image TEXT DEFAULT '',
      product_color TEXT DEFAULT '',
      product_year INTEGER DEFAULT 0,
      items JSONB NOT NULL DEFAULT '[]',
      subtotal NUMERIC NOT NULL DEFAULT 0,
      tax NUMERIC NOT NULL DEFAULT 0,
      total NUMERIC NOT NULL DEFAULT 0,
      initial_payment NUMERIC DEFAULT 0,
      financed_amount NUMERIC DEFAULT 0,
      installments INTEGER DEFAULT 0,
      monthly_payment NUMERIC DEFAULT 0,
      financing_entity TEXT DEFAULT '',
      advisor_name TEXT DEFAULT '',
      advisor_phone TEXT DEFAULT '',
      advisor_email TEXT DEFAULT '',
      created_at TEXT NOT NULL
    )
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      person_name TEXT NOT NULL DEFAULT '',
      document_number TEXT NOT NULL DEFAULT '',
      account_bank TEXT DEFAULT '',
      account_type TEXT DEFAULT '',
      account_number TEXT DEFAULT '',
      signer_name TEXT DEFAULT '',
      signer_role TEXT DEFAULT '',
      created_at TEXT NOT NULL
    )
  `);

  await sql(`
    CREATE TABLE IF NOT EXISTS quotations (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL,
      payment_type TEXT NOT NULL DEFAULT 'contado',
      date TEXT NOT NULL,
      valid_until TEXT DEFAULT '',
      client_name TEXT NOT NULL DEFAULT '',
      product_slug TEXT NOT NULL DEFAULT '',
      product_name TEXT NOT NULL DEFAULT '',
      product_image TEXT DEFAULT '',
      product_color TEXT DEFAULT '',
      product_year INTEGER DEFAULT 0,
      specifications JSONB DEFAULT '{}',
      benefits JSONB DEFAULT '[]',
      features JSONB DEFAULT '[]',
      accent_color TEXT DEFAULT '',
      accent_dark TEXT DEFAULT '',
      category TEXT DEFAULT '',
      price_with_tax NUMERIC DEFAULT 0,
      soat_value NUMERIC DEFAULT 0,
      helmet_value NUMERIC DEFAULT 0,
      accessories_value NUMERIC DEFAULT 0,
      registration_value NUMERIC DEFAULT 0,
      insurance_value NUMERIC DEFAULT 0,
      quantity INTEGER DEFAULT 1,
      total NUMERIC DEFAULT 0,
      advisor_name TEXT DEFAULT '',
      advisor_phone TEXT DEFAULT '',
      advisor_email TEXT DEFAULT '',
      advisor_address TEXT DEFAULT '',
      created_at TEXT NOT NULL
    )
  `);

  return res.status(200).json({ message: 'Migration completed' });
}
