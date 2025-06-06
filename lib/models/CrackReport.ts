import pool from '../db';

export interface CrackReport {
  id: number;
  user_id: number;
  filename: string;
  image_path: string;
  upload_date: Date;
  length_mm: number;
  width_mm: number;
  depth_mm: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendation: string;
  analysis_data?: any;
  created_at: Date;
}

export class CrackReportModel {
  static async create(data: {
    user_id: number;
    filename: string;
    image_path: string;
    length_mm: number;
    width_mm: number;
    depth_mm: number;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    recommendation: string;
    analysis_data?: any;
  }): Promise<CrackReport> {
    const [result] = await pool.execute(
      `INSERT INTO crack_reports 
       (user_id, filename, image_path, length_mm, width_mm, depth_mm, severity, recommendation, analysis_data) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.user_id,
        data.filename,
        data.image_path,
        data.length_mm,
        data.width_mm,
        data.depth_mm,
        data.severity,
        data.recommendation,
        JSON.stringify(data.analysis_data || {})
      ]
    );
    
    const insertId = (result as any).insertId;
    
    const [rows] = await pool.execute(
      'SELECT * FROM crack_reports WHERE id = ?',
      [insertId]
    );
    
    return (rows as CrackReport[])[0];
  }

  static async findByUserId(userId: number): Promise<CrackReport[]> {
    const [rows] = await pool.execute(
      'SELECT * FROM crack_reports WHERE user_id = ? ORDER BY upload_date DESC',
      [userId]
    );
    
    return rows as CrackReport[];
  }

  static async findById(id: number): Promise<CrackReport | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM crack_reports WHERE id = ?',
      [id]
    );
    
    const reports = rows as CrackReport[];
    return reports.length > 0 ? reports[0] : null;
  }

  static async deleteById(id: number, userId: number): Promise<boolean> {
    const [result] = await pool.execute(
      'DELETE FROM crack_reports WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    return (result as any).affectedRows > 0;
  }
}