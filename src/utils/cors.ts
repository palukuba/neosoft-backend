import { Context } from 'hono';

/**
 * Interface pour les variables d'environnement
 */
interface Env {
  ADMIN_TOKEN: string;
  DB: D1Database;
  ALLOWED_ORIGIN: string;
}

/**
 * Configuration CORS pour NEOSOFT.dev
 * Autorise uniquement les requêtes depuis le domaine officiel
 */
export const corsMiddleware = async (c: Context<{ Bindings: Env }>, next: () => Promise<void>) => {
  const origin = c.req.header('Origin');
  const allowedOrigin = c.env.ALLOWED_ORIGIN || 'https://neosoft.dev';
  
  // Vérifier si l'origine est autorisée
  if (origin && origin === allowedOrigin) {
    c.header('Access-Control-Allow-Origin', allowedOrigin);
  } else if (!origin) {
    // Autoriser les requêtes sans origine (ex: Postman, curl)
    c.header('Access-Control-Allow-Origin', '*');
  }
  
  // Headers CORS standards
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  c.header('Access-Control-Max-Age', '86400'); // 24 heures
  
  // Gérer les requêtes OPTIONS (preflight)
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }
  
  await next();
};

/**
 * Headers de sécurité supplémentaires
 */
export const securityHeaders = async (c: Context, next: () => Promise<void>) => {
  await next();
  
  // Headers de sécurité
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Content-Security-Policy', "default-src 'self'");
};

/**
 * Middleware pour limiter la taille des requêtes
 */
export const rateLimitMiddleware = async (c: Context, next: () => Promise<void>) => {
  const contentLength = c.req.header('Content-Length');
  
  if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB max
    return c.json({ 
      error: 'Requête trop volumineuse',
      message: 'La taille de la requête ne peut pas dépasser 1MB' 
    }, 413);
  }
  
  await next();
};
