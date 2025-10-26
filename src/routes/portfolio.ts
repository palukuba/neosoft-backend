import { Hono } from 'hono';
import { authMiddleware, validateRequired, sanitizeInput } from '../utils/auth';

interface Env {
  ADMIN_TOKEN: string;
  DB: D1Database;
  ALLOWED_ORIGIN: string;
}

const portfolio = new Hono<{ Bindings: Env }>();

const CATEGORIES = ['Web', 'Mobile', 'Desktop', 'IA', 'Design', 'Autre'];

// GET /api/portfolio - Liste publique
portfolio.get('/', async (c) => {
  try {
    const category = c.req.query('category');
    const featured = c.req.query('featured');
    
    let query = 'SELECT * FROM portfolio';
    let params: any[] = [];
    let conditions: string[] = [];

    if (category && CATEGORIES.includes(category)) {
      conditions.push('category = ?');
      params.push(category);
    }

    if (featured === 'true') {
      conditions.push('featured = 1');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const projects = await c.env.DB.prepare(query).bind(...params).all();

    return c.json({
      success: true,
      data: {
        projects: projects.results,
        categories: CATEGORIES
      }
    });
  } catch (error) {
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// POST /api/portfolio - Ajouter (protégé)
portfolio.post('/', authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const { title, description, image_url, category, link, technologies, featured } = body;

    const validationError = validateRequired(body, ['title', 'description', 'category']);
    if (validationError) {
      return c.json({ error: validationError }, 400);
    }

    if (!CATEGORIES.includes(category)) {
      return c.json({ error: 'Catégorie invalide' }, 400);
    }

    const result = await c.env.DB.prepare(
      'INSERT INTO portfolio (title, description, image_url, category, link, technologies, featured) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      sanitizeInput(title),
      sanitizeInput(description),
      image_url || null,
      category,
      link || null,
      technologies || null,
      featured ? 1 : 0
    ).run();

    return c.json({ 
      success: true, 
      message: 'Projet ajouté au portfolio',
      data: { id: result.meta.last_row_id }
    }, 201);
  } catch (error) {
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

export default portfolio;
