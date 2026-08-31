import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_velvet_brews_jwt_key_2026_production_secret';

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default generateToken;

