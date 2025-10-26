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
 * Middleware d'authentification pour les routes admin
 * Vérifie la présence et la validité du token Bearer
 */
export const checkAuth = async (c: Context<{ Bindings: Env }>) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader) {
    return c.json({ 
      error: 'Token d\'authentification requis',
      message: 'Veuillez fournir un token dans le header Authorization' 
    }, 401);
  }

  const token = authHeader.replace('Bearer ', '');
  const adminToken = c.env.ADMIN_TOKEN;

  if (!token || token !== adminToken) {
    return c.json({ 
      error: 'Token invalide',
      message: 'Le token fourni n\'est pas valide' 
    }, 403);
  }

  // Token valide, continuer vers la route
  return null;
};

/**
 * Middleware d'authentification réutilisable pour Hono
 */
export const authMiddleware = async (c: Context<{ Bindings: Env }>, next: () => Promise<void>) => {
  const authResult = await checkAuth(c);
  
  if (authResult) {
    return authResult; // Retourne l'erreur d'authentification
  }
  
  await next(); // Continue vers la route suivante
};

/**
 * Utilitaire pour valider les données d'entrée
 */
export const validateRequired = (data: Record<string, any>, requiredFields: string[]): string | null => {
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      return `Le champ '${field}' est requis`;
    }
  }
  return null;
};

/**
 * Utilitaire pour valider les emails
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Utilitaire pour nettoyer et valider les données
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};
