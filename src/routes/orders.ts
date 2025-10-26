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

const orders = new Hono<{ Bindings: Env }>();

/**
 * Services disponibles pour les commandes
 */
const AVAILABLE_SERVICES = [
  'Site Web Vitrine',
  'Site Web E-commerce',
  'Application Mobile iOS',
  'Application Mobile Android',
  'Application Desktop',
  'Système IA/ML',
  'API Backend',
  'Consultation technique',
  'Formation équipe',
  'Maintenance',
  'Autre'
];

/**
 * Statuts disponibles pour les commandes
 */
const ORDER_STATUSES = [
  'pending',      // En attente
  'confirmed',    // Confirmée
  'in_progress',  // En cours
  'completed',    // Terminée
  'cancelled'     // Annulée
];

/**
 * POST /api/orders
 * Créer une nouvelle commande/devis
 */
orders.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { client_name, email, service, details, price } = body;

    // Validation des champs requis
    const validationError = validateRequired(body, ['client_name', 'email', 'service']);
    if (validationError) {
      return c.json({ 
        error: 'Données manquantes',
        message: validationError 
      }, 400);
    }

    // Nettoyage des données
    const cleanClientName = sanitizeInput(client_name);
    const cleanEmail = sanitizeInput(email).toLowerCase();
    const cleanService = sanitizeInput(service);
    const cleanDetails = details ? sanitizeInput(details) : '';
    const orderPrice = price ? parseFloat(price) : null;

    // Validation du format email
    if (!validateEmail(cleanEmail)) {
      return c.json({ 
        error: 'Format email invalide',
        message: 'Veuillez fournir une adresse email valide' 
      }, 400);
    }

    // Validation du service
    if (!AVAILABLE_SERVICES.includes(cleanService)) {
      return c.json({ 
        error: 'Service invalide',
        message: `Service non disponible. Services disponibles: ${AVAILABLE_SERVICES.join(', ')}` 
      }, 400);
    }

    // Validation du prix si fourni
    if (orderPrice !== null && (isNaN(orderPrice) || orderPrice < 0)) {
      return c.json({ 
        error: 'Prix invalide',
        message: 'Le prix doit être un nombre positif' 
      }, 400);
    }

    // Validation de la longueur des champs
    if (cleanClientName.length < 2 || cleanClientName.length > 100) {
      return c.json({ 
        error: 'Nom client invalide',
        message: 'Le nom du client doit contenir entre 2 et 100 caractères' 
      }, 400);
    }

    if (cleanDetails.length > 2000) {
      return c.json({ 
        error: 'Détails trop longs',
        message: 'Les détails ne peuvent pas dépasser 2000 caractères' 
      }, 400);
    }

    // Insérer la nouvelle commande
    const result = await c.env.DB.prepare(
      'INSERT INTO orders (client_name, email, service, details, price) VALUES (?, ?, ?, ?, ?)'
    ).bind(cleanClientName, cleanEmail, cleanService, cleanDetails, orderPrice).run();

    if (result.success) {
      return c.json({ 
        success: true,
        message: 'Commande créée avec succès ! Nous vous contacterons rapidement pour finaliser les détails.',
        data: { 
          id: result.meta.last_row_id,
          client_name: cleanClientName,
          email: cleanEmail,
          service: cleanService,
          price: orderPrice,
          status: 'pending'
        }
      }, 201);
    } else {
      throw new Error('Erreur lors de l\'insertion');
    }

  } catch (error) {
    console.error('Erreur orders POST:', error);
    return c.json({ 
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la création de la commande' 
    }, 500);
  }
});

/**
 * GET /api/orders
 * Lister toutes les commandes (route protégée)
 */
orders.get('/', authMiddleware, async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const status = c.req.query('status');
    const service = c.req.query('service');
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let params: any[] = [];

    if (status && ORDER_STATUSES.includes(status)) {
      whereConditions.push('status = ?');
      params.push(status);
    }

    if (service && AVAILABLE_SERVICES.includes(service)) {
      whereConditions.push('service = ?');
      params.push(service);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Récupérer le nombre total
    const countQuery = `SELECT COUNT(*) as total FROM orders ${whereClause}`;
    const countResult = await c.env.DB.prepare(countQuery).bind(...params).first();
    const total = countResult?.total || 0;

    // Récupérer les commandes
    const ordersQuery = `SELECT * FROM orders ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    const ordersList = await c.env.DB.prepare(ordersQuery).bind(...params).all();

    // Calculer les statistiques
    const statsQuery = `
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(price), 0) as total_value
      FROM orders 
      GROUP BY status
    `;
    const stats = await c.env.DB.prepare(statsQuery).all();

    return c.json({
      success: true,
      data: {
        orders: ordersList.results,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        statistics: stats.results,
        available_services: AVAILABLE_SERVICES,
        available_statuses: ORDER_STATUSES
      }
    });

  } catch (error) {
    console.error('Erreur orders GET:', error);
    return c.json({ 
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les commandes' 
    }, 500);
  }
});

/**
 * GET /api/orders/:id
 * Récupérer une commande spécifique (route protégée)
 */
orders.get('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');

    if (!id || isNaN(parseInt(id))) {
      return c.json({ 
        error: 'ID invalide',
        message: 'Veuillez fournir un ID valide' 
      }, 400);
    }

    const order = await c.env.DB.prepare(
      'SELECT * FROM orders WHERE id = ?'
    ).bind(parseInt(id)).first();

    if (!order) {
      return c.json({ 
        error: 'Commande non trouvée',
        message: 'Aucune commande trouvée avec cet ID' 
      }, 404);
    }

    return c.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Erreur orders GET by ID:', error);
    return c.json({ 
      error: 'Erreur serveur',
      message: 'Impossible de récupérer la commande' 
    }, 500);
  }
});

/**
 * PUT /api/orders/:id
 * Mettre à jour une commande (route protégée)
 */
orders.put('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { status, price, details } = body;

    if (!id || isNaN(parseInt(id))) {
      return c.json({ 
        error: 'ID invalide',
        message: 'Veuillez fournir un ID valide' 
      }, 400);
    }

    // Vérifier que la commande existe
    const existingOrder = await c.env.DB.prepare(
      'SELECT * FROM orders WHERE id = ?'
    ).bind(parseInt(id)).first();

    if (!existingOrder) {
      return c.json({ 
        error: 'Commande non trouvée',
        message: 'Aucune commande trouvée avec cet ID' 
      }, 404);
    }

    let updateFields: string[] = [];
    let params: any[] = [];

    // Mise à jour du statut
    if (status) {
      if (!ORDER_STATUSES.includes(status)) {
        return c.json({ 
          error: 'Statut invalide',
          message: `Statut invalide. Statuts disponibles: ${ORDER_STATUSES.join(', ')}` 
        }, 400);
      }
      updateFields.push('status = ?');
      params.push(status);
    }

    // Mise à jour du prix
    if (price !== undefined) {
      const orderPrice = parseFloat(price);
      if (isNaN(orderPrice) || orderPrice < 0) {
        return c.json({ 
          error: 'Prix invalide',
          message: 'Le prix doit être un nombre positif' 
        }, 400);
      }
      updateFields.push('price = ?');
      params.push(orderPrice);
    }

    // Mise à jour des détails
    if (details !== undefined) {
      const cleanDetails = sanitizeInput(details);
      if (cleanDetails.length > 2000) {
        return c.json({ 
          error: 'Détails trop longs',
          message: 'Les détails ne peuvent pas dépasser 2000 caractères' 
        }, 400);
      }
      updateFields.push('details = ?');
      params.push(cleanDetails);
    }

    if (updateFields.length === 0) {
      return c.json({ 
        error: 'Aucune donnée à mettre à jour',
        message: 'Veuillez fournir au moins un champ à modifier' 
      }, 400);
    }

    params.push(parseInt(id));
    const updateQuery = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`;

    const result = await c.env.DB.prepare(updateQuery).bind(...params).run();

    if (result.success) {
      return c.json({ 
        success: true,
        message: 'Commande mise à jour avec succès' 
      });
    } else {
      throw new Error('Erreur lors de la mise à jour');
    }

  } catch (error) {
    console.error('Erreur orders PUT:', error);
    return c.json({ 
      error: 'Erreur serveur',
      message: 'Impossible de mettre à jour la commande' 
    }, 500);
  }
});

/**
 * DELETE /api/orders/:id
 * Supprimer une commande (route protégée)
 */
orders.delete('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');

    if (!id || isNaN(parseInt(id))) {
      return c.json({ 
        error: 'ID invalide',
        message: 'Veuillez fournir un ID valide' 
      }, 400);
    }

    const result = await c.env.DB.prepare(
      'DELETE FROM orders WHERE id = ?'
    ).bind(parseInt(id)).run();

    if (result.changes === 0) {
      return c.json({ 
        error: 'Commande non trouvée',
        message: 'Aucune commande trouvée avec cet ID' 
      }, 404);
    }

    return c.json({ 
      success: true,
      message: 'Commande supprimée avec succès' 
    });

  } catch (error) {
    console.error('Erreur orders DELETE:', error);
    return c.json({ 
      error: 'Erreur serveur',
      message: 'Impossible de supprimer la commande' 
    }, 500);
  }
});

export default orders;
