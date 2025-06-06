import pool from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export class UserModel {
  static async create(name: string, email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    
    const insertId = (result as any).insertId;
    
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [insertId]
    );
    
    return (rows as User[])[0];
  }

  static async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  }

  static async findById(id: number): Promise<User | null> {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    
    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  }

  static async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(userId: number): string {
    return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  }

  static verifyToken(token: string): { userId: number } | null {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    } catch {
      return null;
    }
  }
}