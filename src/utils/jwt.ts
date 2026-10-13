import jwt, { type JwtPayload, type Secret, type SignOptions } from "jsonwebtoken";

export const createToken = (
  jwtPayload: { id: string; email: string; role: string },
  secret: Secret,
  expiresIn: string | number,
): string => {
  const options: SignOptions = {
    expiresIn: expiresIn as any,
  };
  return jwt.sign(jwtPayload, secret, options);
};

export const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

export default {
  createToken,
  verifyToken,
};
