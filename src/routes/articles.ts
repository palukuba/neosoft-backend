import { Hono } from 'hono';
import { authMiddleware, validateRequired, sanitizeInput } from '../utils/auth';

interface Env {
  ADMIN_TOKEN: string;
  DB: D1Database;
  ALLOWED_ORIGIN: string;
}

const articles = new Hono<{ Bindings: Env }>();

// GET /api/articles - Liste publique
articles.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const offset = (page - 1) * limit;

    const articlesList = await c.env.DB.prepare(
      'SELECT id, title, slug, author, tags, created_at FROM articles WHERE published = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).bind(limit, offset).all();

    const countResult = await c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM articles WHERE published = 1'
    ).first();

    return c.json({
      success: true,
      data: {
        articles: articlesList.results,
        pagination: {
          page,
          limit,
          total: countResult?.total || 0,
          pages: Math.ceil((countResult?.total || 0) / limit)
        }
      }
    });
  } catch (error) {
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// GET /api/articles/:slug - Article unique
articles.get('/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const article = await c.env.DB.prepare(
      'SELECT * FROM articles WHERE slug = ? AND published = 1'
    ).bind(slug).first();

    if (!article) {
      return c.json({ error: 'Article non trouvé' }, 404);
    }

    return c.json({ success: true, data: article });
  } catch (error) {
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// POST /api/articles - Ajouter (protégé)
articles.post('/', authMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const { title, slug, content, author, tags } = body;

    const validationError = validateRequired(body, ['title', 'slug', 'content', 'author']);
    if (validationError) {
      return c.json({ error: validationError }, 400);
    }

    const result = await c.env.DB.prepare(
      'INSERT INTO articles (title, slug, content, author, tags) VALUES (?, ?, ?, ?, ?)'
    ).bind(sanitizeInput(title), sanitizeInput(slug), content, sanitizeInput(author), tags || '').run();

    return c.json({ 
      success: true, 
      message: 'Article créé',
      data: { id: result.meta.last_row_id }
    }, 201);
  } catch (error) {
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

export default articles;
