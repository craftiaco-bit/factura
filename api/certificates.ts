import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const rows = await sql('SELECT * FROM certificates ORDER BY created_at DESC');
    const certs = rows.map(toCertificate);
    return res.status(200).json(certs);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    await sql('DELETE FROM certificates WHERE id = $1', [id]);
    return res.status(200).json({ deleted: true });
  }

  if (req.method === 'POST') {
    const d = req.body;
    await sql(
      `INSERT INTO certificates (id, person_name, document_number, account_bank, account_type, account_number, signer_name, signer_role, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO UPDATE SET
        person_name=$2, document_number=$3, account_bank=$4, account_type=$5, account_number=$6, signer_name=$7, signer_role=$8`,
      [d.id, d.personName, d.documentNumber, d.accountBank, d.accountType, d.accountNumber, d.signerName, d.signerRole, d.createdAt]
    );
    return res.status(200).json(d);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

function toCertificate(r: Record<string, unknown>) {
  return {
    id: r.id,
    personName: r.person_name,
    documentNumber: r.document_number,
    accountBank: r.account_bank,
    accountType: r.account_type,
    accountNumber: r.account_number,
    signerName: r.signer_name,
    signerRole: r.signer_role,
    createdAt: r.created_at,
  };
}
