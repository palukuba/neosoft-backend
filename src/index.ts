import { Hono } from 'hono';
import { corsMiddleware, securityHeaders, rateLimitMiddleware } from './utils/cors';

// Import des routes
import newsletter from './routes/newsletter';
import contact from './routes/contact';
import appointments from './routes/appointments';
import orders from './routes/orders';
import articles from './routes/articles';
import portfolio from './routes/portfolio';

/**
 * Interface pour les variables d'environnement Cloudflare
 */
interface Env {
  ADMIN_TOKEN: string;
  DB: D1Database;
  ALLOWED_ORIGIN: string;
}

// Initialisation de l'application Hono
const app = new Hono<{ Bindings: Env }>();

// Middlewares globaux
app.use('*', corsMiddleware);
app.use('*', securityHeaders);
app.use('*', rateLimitMiddleware);

// Route de santé / status
app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'NEOSOFT.dev API Backend',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      newsletter: '/api/newsletter',
      contact: '/api/contact',
      appointments: '/api/appointments',
      orders: '/api/orders',
      articles: '/api/articles',
      portfolio: '/api/portfolio'
    },
    documentation: 'https://neosoft.dev/api/docs'
  });
});

// Route de vérification de la base de données
app.get('/health', async (c) => {
  try {
    // Test simple de connexion à la DB
    const result = await c.env.DB.prepare('SELECT 1 as test').first();
    
    return c.json({
      success: true,
      status: 'healthy',
      database: result ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      success: false,
      status: 'unhealthy',
      database: 'error',
      error: 'Database connection failed',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Montage des routes API
app.route('/api/newsletter', newsletter);
app.route('/api/contact', contact);
app.route('/api/appointments', appointments);
app.route('/api/orders', orders);
app.route('/api/articles', articles);
app.route('/api/portfolio', portfolio);

// Route 404 pour les endpoints non trouvés
app.notFound((c) => {
  return c.json({
    error: 'Endpoint non trouvé',
    message: 'L\'endpoint demandé n\'existe pas',
    available_endpoints: [
      'GET /',
      'GET /health',
      'POST /api/newsletter',
      'GET /api/newsletter (admin)',
      'POST /api/contact',
      'GET /api/contact (admin)',
      'POST /api/appointments',
      'GET /api/appointments (admin)',
      'POST /api/orders',
      'GET /api/orders (admin)',
      'GET /api/articles',
      'GET /api/articles/:slug',
      'POST /api/articles (admin)',
      'GET /api/portfolio',
      'POST /api/portfolio (admin)'
    ]
  }, 404);
});

// Gestionnaire d'erreurs global
app.onError((err, c) => {
  console.error('Erreur globale:', err);
  
  return c.json({
    error: 'Erreur interne du serveur',
    message: 'Une erreur inattendue s\'est produite',
    timestamp: new Date().toISOString()
  }, 500);
});

// Export pour Cloudflare Workers
export default app;
