import { NextApiRequest, NextApiResponse } from 'next';
import { CrackReportModel } from '../../../lib/models/CrackReport';
import { UserModel } from '../../../lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = UserModel.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    if (req.method === 'GET') {
      const reports = await CrackReportModel.findByUserId(decoded.userId);
      return res.status(200).json({ reports });
    }

    if (req.method === 'POST') {
      const {
        filename,
        image_path,
        length_mm,
        width_mm,
        depth_mm,
        severity,
        recommendation,
        analysis_data
      } = req.body;

      const report = await CrackReportModel.create({
        user_id: decoded.userId,
        filename,
        image_path,
        length_mm,
        width_mm,
        depth_mm,
        severity,
        recommendation,
        analysis_data
      });

      return res.status(201).json({ report });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Reports API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}