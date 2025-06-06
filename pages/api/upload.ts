import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const upload = multer({
  storage: multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Ensure uploads directory exists
  const uploadsDir = './public/uploads/';
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const uploadMiddleware = upload.single('image');
  
  uploadMiddleware(req as any, res as any, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Simulate AI analysis (replace with your actual AI model)
    const analysisResult = {
      length_mm: Math.random() * 100 + 10,
      width_mm: Math.random() * 5 + 0.5,
      depth_mm: Math.random() * 20 + 2,
      severity: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
      recommendation: 'Based on the analysis, this crack requires monitoring. Consider professional inspection if it grows.',
      confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
    };

    res.status(200).json({
      success: true,
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      analysis: analysisResult
    });
  });
}