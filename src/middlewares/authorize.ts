import { auth } from "./auth.js";

export const authorize = (...roles: string[]) => auth(...roles);

export default authorize;
