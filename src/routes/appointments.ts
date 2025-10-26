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

const appointments = new Hono<{ Bindings: Env }>();

/**
 * Services disponibles pour les rendez-vous
 */
const AVAILABLE_SERVICES = [
  'Développement Web',
  'Développement Mobile',
  'Développement Desktop',
  'Intelligence Artificielle',
  'Consultation technique',
  'Audit de code',
  'Formation',
  'Autre'
];

/**
 * POST /api/appointments
 * Créer un nouveau rendez-vous
 */
appointments.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, phone, date, service, message } = body;

    // Validation des champs requis
    const validationError = validateRequired(body, ['name', 'email', 'date', 'service']);
    if (validationError) {
      return c.json({ 
        error: 'Données manquantes',
        message: validationError 
      }, 400);
    }

    // Nettoyage des données
    const cleanName = sanitizeInput(name);
    const cleanEmail = sanitizeInput(email).toLowerCase();
    const cleanPhone = phone ? sanitizeInput(phone) : '';
    const cleanService = sanitizeInput(service);
    const cleanMessage = message ? sanitizeInput(message) : '';

    // Validation du format email
    if (!validateEmail(cleanEmail)) {
      return c.json({ 
        error: 'Format email invalide',
        message: 'Veuillez fournir une adresse email valide' 
      }, 400);
    }

    // Validation de la date
    const appointmentDate = new Date(date);
    const now = new Date();
    
    if (isNaN(appointmentDate.getTime())) {
      return c.json({ 
        error: 'Date invalide',
        message: 'Veuillez fournir une date valide au format ISO' 
      }, 400);
    }

    if (appointmentDate <= now) {
      return c.json({ 
        error: 'Date invalide',
        message: 'La date du rendez-vous doit être dans le futur' 
      }, 400);
    }

    // Validation du service
    if (!AVAILABLE_SERVICES.includes(cleanService)) {
      return c.json({ 
        error: 'Service invalide',
        message: `Service non disponible. Services disponibles: ${AVAILABLE_SERVICES.join(', ')}` 
      }, 400);
    }

    // Vérifier s'il n'y a pas déjà un rendez-vous à cette date/heure
    const existingAppointment = await c.env.DB.prepare(
      'SELECT id FROM appointments WHERE date = ? AND status != ?'
    ).bind(date, 'cancelled').first();

    if (existingAppointment) {
      return c.json({ 
        error: 'Créneau non disponible',
        message: 'Un rendez-vous est déjà programmé à cette date et heure' 
      }, 409);
    }

    // Insérer le nouveau rendez-vous
    const result = await c.env.DB.prepare(
      'INSERT INTO appointments (name, email, phone, date, service, message) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(cleanName, cleanEmail, cleanPhone, date, cleanService, cleanMessage).run();

    if (result.success) {
      return c.json({ 
        success: true,
        message: 'Rendez-vous programmé avec succès ! Nous vous confirmerons par email.',
        data: { 
          id: result.meta.last_row_id,
          name: cleanName,
          email: cleanEmail,
          date: date,
          service: cleanService,
          status: 'pending'
        }
      }, 201);
    } else {
      throw new Error('Erreur lors de l\'insertion');
    }

  } catch (error) {
    console.error('Erreur appointments POST:', error);
    return c.json({ 
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la programmation du rendez-vous' 
    }, 500);
  }
});

/**
 * GET /api/appointments
 * Lister tous les rendez-vous (route protégée)
 */
appointments.get('/', authMiddleware, async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const status = c.req.query('status');
    const offset = (page - 1) * limit;

    let query = 'SELECT COUNT(*) as total FROM appointments';
    let params: any[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    // Récupérer le nombre total
    const countResult = await c.env.DB.prepare(query).bind(...params).first();
    const total = countResult?.total || 0;

    // Récupérer les rendez-vous
    query = 'SELECT * FROM appointments';
    if (status) {
      query += ' WHERE status = ?';
    }
    query += ' ORDER BY date ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const appointmentsList = await c.env.DB.prepare(query).bind(...params).all();

    return c.json({
      success: true,
      data: {
        appointments: appointmentsList.results,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        available_services: AVAILABLE_SERVICES
      }
    });

  } catch (error) {
    console.error('Erreur appointments GET:', error);
    return c.json({ 
      error: 'Erreur serveur',
      message: 'Impossible de récupérer les rendez-vous' 
    }, 500);
  }
});

/**
 * PUT /api/appointments/:id/status
 * Mettre à jour le statut d'un rendez-vous (route protégée)
 */
appointments.put('/:id/status', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { status } = body;

    if (!id || isNaN(parseInt(id))) {
      return c.json({ 
        error: 'ID invalide',
        message: 'Veuillez fournir un ID valide' 
      }, 400);
    }

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return c.json({ 
        error: 'Statut invalide',
        message: `Statut invalide. Statuts disponibles: ${validStatuses.join(', ')}` 
      }, 400);
    }

    const result = await c.env.DB.prepare(
      'UPDATE appointments SET status = ? WHERE id = ?'
    ).bind(status, parseInt(id)).run();

    if (result.changes === 0) {
      return c.json({ 
        error: 'Rendez-vous non trouvé',
        message: 'Aucun rendez-vous trouvé avec cet ID' 
      }, 404);
    }

    return c.json({ 
      success: true,
      message: `Statut du rendez-vous mis à jour: ${status}` 
    });

  } catch (error) {
    console.error('Erreur appointments PUT status:', error);
    return c.json({ 
      error: 'Erreur serveur',
      message: 'Impossible de mettre à jour le statut' 
    }, 500);
  }
});

/**
 * DELETE /api/appointments/:id
 * Supprimer un rendez-vous (route protégée)
 */
appointments.delete('/:id', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id');

    if (!id || isNaN(parseInt(id))) {
      return c.json({ 
        error: 'ID invalide',
        message: 'Veuillez fournir un ID valide' 
      }, 400);
    }

    const result = await c.env.DB.prepare(
      'DELETE FROM appointments WHERE id = ?'
    ).bind(parseInt(id)).run();

    if (result.changes === 0) {
      return c.json({ 
        error: 'Rendez-vous non trouvé',
        message: 'Aucun rendez-vous trouvé avec cet ID' 
      }, 404);
    }

    return c.json({ 
      success: true,
      message: 'Rendez-vous supprimé avec succès' 
    });

  } catch (error) {
    console.error('Erreur appointments DELETE:', error);
    return c.json({ 
      error: 'Erreur serveur',
      message: 'Impossible de supprimer le rendez-vous' 
    }, 500);
  }
});

export default appointments;
