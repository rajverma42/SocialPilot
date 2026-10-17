import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from '../db';

export type UserRole = 'owner' | 'admin' | 'editor' | 'publisher' | 'viewer';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  role: UserRole;
  workspaceId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      correlationId?: string;
    }
  }
}

// In-memory token/rate-limit buckets
const rateLimitMap: Map<string, { count: number; resetAt: number }> = new Map();

export function correlationMiddleware(req: Request, res: Response, next: NextFunction) {
  const correlationId = (req.headers['x-correlation-id'] as string) || `req-${crypto.randomBytes(8).toString('hex')}`;
  req.correlationId = correlationId;
  res.setHeader('x-correlation-id', correlationId);
  next();
}

export function rateLimitMiddleware(limit = 120, windowMs = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = (req.user?.uid || req.ip || 'anonymous') as string;
    const now = Date.now();
    const bucket = rateLimitMap.get(key);

    if (!bucket || now > bucket.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (bucket.count >= limit) {
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests. Limit is ${limit} requests per minute.`,
          correlationId: req.correlationId
        }
      });
    }

    bucket.count++;
    next();
  };
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const workspaceHeader = (req.headers['x-workspace-id'] as string) || req.query.workspaceId as string || 'ws-default-01';

  // Support Bearer token or development/mock session identity
  let uid = 'usr-admin-01';
  let email = 'riteshkumarverma486@gmail.com';
  let role: UserRole = 'owner';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // If a JWT token is passed, verify structure
    if (token.startsWith('user_')) {
      uid = token;
    }
  }

  // Verify user against active workspace in database
  const workspaces = db.getWorkspaces();
  const workspace = workspaces.find(w => w.id === workspaceHeader) || workspaces[0];

  if (!workspace) {
    return res.status(404).json({
      error: {
        code: 'WORKSPACE_NOT_FOUND',
        message: 'The requested workspace does not exist.',
        correlationId: req.correlationId
      }
    });
  }

  // Derive role
  if (workspace.ownerId === uid) {
    role = 'owner';
  } else {
    role = 'editor';
  }

  req.user = {
    uid,
    email,
    role,
    workspaceId: workspace.id
  };

  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required for this resource.',
          correlationId: req.correlationId
        }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      // Audit log the security rejection
      db.addNotification({
        id: `audit-${Date.now()}`,
        workspaceId: req.user.workspaceId,
        type: 'system',
        title: 'Access Denied',
        message: `User ${req.user.uid} with role "${req.user.role}" was denied access to ${req.originalUrl}. Required: ${allowedRoles.join(', ')}`,
        timestamp: new Date().toISOString(),
        read: false
      });

      return res.status(403).json({
        error: {
          code: 'PERMISSION_DENIED',
          message: `Insufficient permissions. Your role '${req.user.role}' lacks permission for this action.`,
          correlationId: req.correlationId
        }
      });
    }

    next();
  };
}
