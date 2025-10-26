import { Hono } from 'hono';
import { authMiddleware, validateRequired, validateEmail, sanitizeInput } from '../utils/auth';

/**
 * Interface pour les variables d'environnement
 */
interface Env {
  ADMIN_TOKEN: string;
  DB: D1Database;
  ALLOWED_ORIGIN: string;
}

const contact = new Hono<{ Bindings: Env }>();

/**
 * POST /api/contact
 * Soumettre un nouveau message de contact
 */
contact.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, subject, message } = body;

    // Validation des champs requis
    const validationError = validateRequired(body, ['name', 'email', 'message']);
    if (validationError) {
      return c.json({ 
        error: 'Données manquantes',
        message: validationError 
      }, 400);
    }

    // Nettoyage et validation des données
    const cleanName = sanitizeInput(name);
    const cleanEmail = sanitizeInput(email).toLowerCase();
    const cleanSubject = subject ? sanitizeInput(subject) : '';
    const cleanMessage = sanitizeInput(message);

    // Validation du format email
    if (!validateEmail(cleanEmail)) {
      return c.json({ 
        error: 'Format email invalide',
        message: 'Veuillez fournir une adresse email valide' 
      }, 400);
    }

    // Validation de la longueur des champs
    if (cleanName.length < 2 || cleanName.length > 100) {
      return c.json({ 
        error: 'Nom invalide',
        message: 'Le nom doit contenir entre 2 et 100 caractères' 
      }, 400);
    }

    if (cleanMessage.length < 10 || cleanMessage.length > 2000) {
      return c.json({ 
        error: 'Message invalide',
        message: 'Le message doit contenir entre 10 et 2000 caractères' 
      }, 400);
    }

    // Insérer le message de contact
    const result = await c.env.DB.prepare(
      'INSERT INTO contact (name, email, subject, message) VALUES (?, ?, ?, ?)'
    ).bind(cleanName, cleanEmail, cleanSubject, cleanMessage).run();

    if (result.success) {
      return c.json({ 
        success: true,
        message: 'Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.',
        data: { 
          id: result.meta.last_row_id,
          name: cleanName,
          email: cleanEmail,
          subject: cleanSubject
        }
      }, 201);
    } else {
      throw new Error('Erreur lors de l\'insertion');
    }

  } catch (error) {
    console.error('Erreur contact POST:', error);
    return c.json({ 
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de l\'envoi du message' 
    }, 500);
  }
});

/**
 * GET /api/contact
 * Lister tous les messages de contact (route protégée)
 */
contact.get('/', authMiddleware, async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

    // Récupérer le nombre total de messages
    const countResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM contact'
    ).first();

    const total = countResult?.total || 0;

    // Récupérer les messages avec pagination
    const messages = await c.env.DB.prepare(
      'SELECT id, name, email, subject, message, created_at FROM contact ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).bind(limit, offset).all();

    return c.json({
      success: true,
      data: {
        messages: messages.results,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Erreur contact GET:', error);
    return c.json({ 
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les messages de contact' 
    }, 500);
  }
});

/**
 * GET /api/contact/:id
 * Récupérer un message spécifique (route protégée)
 */
contact.get('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');

    if (!id || isNaN(parseInt(id))) {
      return c.json({ 
        error: 'ID invalide',
        message: 'Veuillez fournir un ID valide' 
      }, 400);
    }

    const message = await c.env.DB.prepare(
      'SELECT * FROM contact WHERE id = ?'
    ).bind(parseInt(id)).first();

    if (!message) {
      return c.json({ 
        error: 'Message non trouvé',
        message: 'Aucun message trouvé avec cet ID' 
      }, 404);
    }

    return c.json({
      success: true,
      data: message
    });

  } catch (error) {
    console.error('Erreur contact GET by ID:', error);
    return c.json({ 
      error: 'Erreur serveur',
      message: 'Impossible de récupérer le message' 
    }, 500);
  }
});

/**
 * DELETE /api/contact/:id
 * Supprimer un message (route protégée)
 */
contact.delete('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');

    if (!id || isNaN(parseInt(id))) {
      return c.json({ 
        error: 'ID invalide',
        message: 'Veuillez fournir un ID valide' 
      }, 400);
    }

    const result = await c.env.DB.prepare(
      'DELETE FROM contact WHERE id = ?'
    ).bind(parseInt(id)).run();

    if (result.changes === 0) {
      return c.json({ 
        error: 'Message non trouvé',
        message: 'Aucun message trouvé avec cet ID' 
      }, 404);
    }

    return c.json({ 
      success: true,
      message: 'Message supprimé avec succès' 
    });

  } catch (error) {
    console.error('Erreur contact DELETE:', error);
    return c.json({ 
      error: 'Erreur serveur',
      message: 'Impossible de supprimer le message' 
    }, 500);
  }
});

export default contact;
