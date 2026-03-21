import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (req.method === 'DELETE') {
    await sql('DELETE FROM certificates WHERE id = $1', [id]);
    return res.status(200).json({ deleted: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
