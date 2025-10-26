import { Hono } from 'hono';
import { authMiddleware, validateEmail, sanitizeInput } from '../utils/auth';

/**
 * Interface pour les variables d'environnement
 */
interface Env {
  ADMIN_TOKEN: string;
  DB: D1Database;
  ALLOWED_ORIGIN: string;
}

const newsletter = new Hono<{ Bindings: Env }>();

/**
 * POST /api/newsletter
 * Ajouter un nouvel abonné à la newsletter
 */
newsletter.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    // Validation des données
    if (!email) {
      return c.json({ 
        error: 'Email requis',
        message: 'Veuillez fournir une adresse email' 
      }, 400);
    }

    const cleanEmail = sanitizeInput(email).toLowerCase();

    // Validation du format email
    if (!validateEmail(cleanEmail)) {
      return c.json({ 
        error: 'Format email invalide',
        message: 'Veuillez fournir une adresse email valide' 
      }, 400);
    }

    // Vérifier si l'email existe déjà
    const existing = await c.env.DB.prepare(
      'SELECT id FROM newsletter WHERE email = ?'
    ).bind(cleanEmail).first();

    if (existing) {
      return c.json({ 
        error: 'Email déjà inscrit',
        message: 'Cette adresse email est déjà abonnée à notre newsletter' 
      }, 409);
    }

    // Insérer le nouvel abonné
    const result = await c.env.DB.prepare(
      'INSERT INTO newsletter (email) VALUES (?)'
    ).bind(cleanEmail).run();

    if (result.success) {
      return c.json({ 
        success: true,
        message: 'Inscription réussie ! Merci de vous être abonné à notre newsletter.',
        data: { 
          id: result.meta.last_row_id,
          email: cleanEmail 
        }
      }, 201);
    } else {
      throw new Error('Erreur lors de l\'insertion');
    }

  } catch (error) {
    console.error('Erreur newsletter POST:', error);
    return c.json({ 
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de l\'inscription' 
    }, 500);
  }
});

/**
 * GET /api/newsletter
 * Lister tous les abonnés (route protégée)
 */
newsletter.get('/', authMiddleware, async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = (page - 1) * limit;

    // Récupérer le nombre total d'abonnés
    const countResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM newsletter'
    ).first();

    const total = countResult?.total || 0;

    // Récupérer les abonnés avec pagination
    const subscribers = await c.env.DB.prepare(
      'SELECT id, email, created_at FROM newsletter ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).bind(limit, offset).all();

    return c.json({
      success: true,
      data: {
        subscribers: subscribers.results,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Erreur newsletter GET:', error);
    return c.json({ 
      error: 'Erreur serveur',
      message: 'Impossible de récupérer la liste des abonnés' 
    }, 500);
  }
});

/**
 * DELETE /api/newsletter/:id
 * Supprimer un abonné (route protégée)
 */
newsletter.delete('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');

    if (!id || isNaN(parseInt(id))) {
      return c.json({ 
        error: 'ID invalide',
        message: 'Veuillez fournir un ID valide' 
      }, 400);
    }

    const result = await c.env.DB.prepare(
      'DELETE FROM newsletter WHERE id = ?'
    ).bind(parseInt(id)).run();

    if (result.changes === 0) {
      return c.json({ 
        error: 'Abonné non trouvé',
        message: 'Aucun abonné trouvé avec cet ID' 
      }, 404);
    }

    return c.json({ 
      success: true,
      message: 'Abonné supprimé avec succès' 
    });

  } catch (error) {
    console.error('Erreur newsletter DELETE:', error);
    return c.json({ 
      error: 'Erreur serveur',
      message: 'Impossible de supprimer l\'abonné' 
    }, 500);
  }
});

export default newsletter;
