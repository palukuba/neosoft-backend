/**
 * Tests basiques pour l'API NEOSOFT.dev
 * Usage: node tests/api.test.js
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:8787';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'test_token';

// Fonction utilitaire pour les requêtes
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  const data = await response.json();
  return { status: response.status, data };
}

// Tests
async function runTests() {
  console.log('🧪 Tests de l\'API NEOSOFT.dev');
  console.log('================================');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Status de l'API
  try {
    console.log('\n1. Test du status de l\'API...');
    const result = await apiRequest('/');
    
    if (result.status === 200 && result.data.success) {
      console.log('✅ Status API: OK');
      passed++;
    } else {
      console.log('❌ Status API: FAILED');
      failed++;
    }
  } catch (error) {
    console.log('❌ Status API: ERROR -', error.message);
    failed++;
  }
  
  // Test 2: Health check
  try {
    console.log('\n2. Test du health check...');
    const result = await apiRequest('/health');
    
    if (result.status === 200 && result.data.status === 'healthy') {
      console.log('✅ Health check: OK');
      passed++;
    } else {
      console.log('❌ Health check: FAILED');
      failed++;
    }
  } catch (error) {
    console.log('❌ Health check: ERROR -', error.message);
    failed++;
  }
  
  // Test 3: Newsletter inscription
  try {
    console.log('\n3. Test inscription newsletter...');
    const testEmail = `test${Date.now()}@example.com`;
    const result = await apiRequest('/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail })
    });
    
    if (result.status === 201 && result.data.success) {
      console.log('✅ Newsletter inscription: OK');
      passed++;
    } else {
      console.log('❌ Newsletter inscription: FAILED');
      console.log('Response:', result);
      failed++;
    }
  } catch (error) {
    console.log('❌ Newsletter inscription: ERROR -', error.message);
    failed++;
  }
  
  // Test 4: Contact message
  try {
    console.log('\n4. Test message de contact...');
    const result = await apiRequest('/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Message',
        message: 'Ceci est un message de test pour valider l\'API.'
      })
    });
    
    if (result.status === 201 && result.data.success) {
      console.log('✅ Message de contact: OK');
      passed++;
    } else {
      console.log('❌ Message de contact: FAILED');
      failed++;
    }
  } catch (error) {
    console.log('❌ Message de contact: ERROR -', error.message);
    failed++;
  }
  
  // Test 5: Articles publics
  try {
    console.log('\n5. Test récupération articles...');
    const result = await apiRequest('/api/articles');
    
    if (result.status === 200 && result.data.success) {
      console.log('✅ Articles publics: OK');
      passed++;
    } else {
      console.log('❌ Articles publics: FAILED');
      failed++;
    }
  } catch (error) {
    console.log('❌ Articles publics: ERROR -', error.message);
    failed++;
  }
  
  // Test 6: Portfolio
  try {
    console.log('\n6. Test récupération portfolio...');
    const result = await apiRequest('/api/portfolio');
    
    if (result.status === 200 && result.data.success) {
      console.log('✅ Portfolio: OK');
      passed++;
    } else {
      console.log('❌ Portfolio: FAILED');
      failed++;
    }
  } catch (error) {
    console.log('❌ Portfolio: ERROR -', error.message);
    failed++;
  }
  
  // Test 7: Route admin (doit échouer sans token)
  try {
    console.log('\n7. Test sécurité route admin...');
    const result = await apiRequest('/api/newsletter');
    
    if (result.status === 401) {
      console.log('✅ Sécurité admin: OK (accès refusé sans token)');
      passed++;
    } else {
      console.log('❌ Sécurité admin: FAILED (accès autorisé sans token)');
      failed++;
    }
  } catch (error) {
    console.log('❌ Sécurité admin: ERROR -', error.message);
    failed++;
  }
  
  // Test 8: Route 404
  try {
    console.log('\n8. Test route inexistante...');
    const result = await apiRequest('/api/inexistant');
    
    if (result.status === 404) {
      console.log('✅ Route 404: OK');
      passed++;
    } else {
      console.log('❌ Route 404: FAILED');
      failed++;
    }
  } catch (error) {
    console.log('❌ Route 404: ERROR -', error.message);
    failed++;
  }
  
  // Résultats
  console.log('\n📊 Résultats des tests');
  console.log('======================');
  console.log(`✅ Tests réussis: ${passed}`);
  console.log(`❌ Tests échoués: ${failed}`);
  console.log(`📈 Taux de réussite: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 Tous les tests sont passés avec succès !');
    process.exit(0);
  } else {
    console.log('\n⚠️ Certains tests ont échoué. Vérifiez la configuration.');
    process.exit(1);
  }
}

// Vérification de Node.js fetch
if (typeof fetch === 'undefined') {
  console.log('❌ fetch n\'est pas disponible. Utilisez Node.js 18+ ou installez node-fetch');
  process.exit(1);
}

// Lancement des tests
runTests().catch(error => {
  console.error('❌ Erreur lors des tests:', error);
  process.exit(1);
});
