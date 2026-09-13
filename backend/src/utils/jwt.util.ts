import jwt from 'jsonwebtoken';

const isProduction = process.env.NODE_ENV === 'production';

const getSecret = (key: string, fallback: string): string => {
  const val = process.env[key];
  if (!val || val === fallback) {
    if (isProduction) {
      throw new Error(`CRITICAL SECURITY ERROR: ${key} must be defined with a secure secret in production!`);
    }
  }
  return val || fallback;
};

export const ACCESS_SECRET = getSecret('JWT_ACCESS_SECRET', 'minhkhoa_dev_jwt_access_secret_only');
export const REFRESH_SECRET = getSecret('JWT_REFRESH_SECRET', 'minhkhoa_dev_jwt_refresh_secret_only');
const ACCESS_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

export const generateAccessToken = (userId: string, role: string) => {
  return jwt.sign({ userId, role }, ACCESS_SECRET, { 
    expiresIn: ACCESS_EXPIRES_IN as any,
    algorithm: 'HS256'
  });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, REFRESH_SECRET, { 
    expiresIn: REFRESH_EXPIRES_IN as any,
    algorithm: 'HS256'
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_SECRET, { algorithms: ['HS256'] }) as { 
    userId: string; 
    role: string; 
    iat: number; 
    exp: number 
  };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_SECRET, { algorithms: ['HS256'] }) as { 
    userId: string; 
    iat: number; 
    exp: number 
  };
};
