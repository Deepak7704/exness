import { createUser, validateUser } from '../services/userAuthentication';
import { generateToken } from '../utils/tokenUtils';
import type { Request, Response } from 'express';

export async function signupController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await createUser(email, password);
    const token = generateToken(user.id);
    return res.status(201).json({ token });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: error.message });
  }
}

export async function signinController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await validateUser(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = generateToken(user.id);
    return res.status(200).json({ token });
  } catch (error: any) {
    console.error('Signin error:', error);
    return res.status(500).json({ error: error.message });
  }
}
