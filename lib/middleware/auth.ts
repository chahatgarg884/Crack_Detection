import { NextRequest } from 'next/server';
import { UserModel } from '../models/User';

export async function authenticateToken(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return { error: 'No token provided', status: 401 };
  }

  const decoded = UserModel.verifyToken(token);
  if (!decoded) {
    return { error: 'Invalid token', status: 401 };
  }

  const user = await UserModel.findById(decoded.userId);
  if (!user) {
    return { error: 'User not found', status: 404 };
  }

  return { user };
}