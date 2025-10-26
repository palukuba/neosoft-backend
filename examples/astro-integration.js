/**
 * Exemples d'intégration avec Astro.js
 * Utilisation de l'API NEOSOFT.dev depuis le frontend
 */

const API_BASE_URL = 'https://api.neosoft.dev';

// 1. Newsletter - Inscription
export async function subscribeToNewsletter(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/newsletter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    return { success: false, error: 'Erreur de connexion' };
  }
}

// 2. Contact - Envoi de message
export async function sendContactMessage(formData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      })
    });

    const data = await response.json();
    return response.ok ? 
      { success: true, message: data.message } : 
      { success: false, error: data.message };
  } catch (error) {
    return { success: false, error: 'Erreur de connexion' };
  }
}

// 3. Rendez-vous - Prise de RDV
export async function bookAppointment(appointmentData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: appointmentData.name,
        email: appointmentData.email,
        phone: appointmentData.phone,
        date: appointmentData.date,
        service: appointmentData.service,
        message: appointmentData.message
      })
    });

    const data = await response.json();
    return response.ok ? 
      { success: true, message: data.message } : 
      { success: false, error: data.message };
  } catch (error) {
    return { success: false, error: 'Erreur de connexion' };
  }
}

// 4. Commandes - Création de devis
export async function createOrder(orderData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_name: orderData.clientName,
        email: orderData.email,
        service: orderData.service,
        details: orderData.details,
        price: orderData.price
      })
    });

    const data = await response.json();
    return response.ok ? 
      { success: true, message: data.message } : 
      { success: false, error: data.message };
  } catch (error) {
    return { success: false, error: 'Erreur de connexion' };
  }
}

// 5. Articles - Récupération du blog
export async function getArticles(page = 1, limit = 10) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/articles?page=${page}&limit=${limit}`);
    const data = await response.json();
    
    return response.ok ? data.data : { articles: [], pagination: {} };
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error);
    return { articles: [], pagination: {} };
  }
}

// 6. Article spécifique
export async function getArticle(slug) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/articles/${slug}`);
    const data = await response.json();
    
    return response.ok ? data.data : null;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article:', error);
    return null;
  }
}

// 7. Portfolio - Récupération des projets
export async function getPortfolio(category = null, featured = false) {
  try {
    let url = `${API_BASE_URL}/api/portfolio`;
    const params = new URLSearchParams();
    
    if (category) params.append('category', category);
    if (featured) params.append('featured', 'true');
    
    if (params.toString()) {
      url += '?' + params.toString();
    }

    const response = await fetch(url);
    const data = await response.json();
    
    return response.ok ? data.data : { projects: [], categories: [] };
  } catch (error) {
    console.error('Erreur lors de la récupération du portfolio:', error);
    return { projects: [], categories: [] };
  }
}

// Exemple d'utilisation dans un composant Astro
/*
---
// Dans un fichier .astro
import { subscribeToNewsletter, getArticles } from '../utils/api.js';

// Récupération des articles côté serveur
const articlesData = await getArticles(1, 5);
---

<script>
  // Côté client pour les formulaires
  document.getElementById('newsletter-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    
    const result = await subscribeToNewsletter(email);
    
    if (result.success) {
      alert(result.message);
      e.target.reset();
    } else {
      alert(result.error);
    }
  });
</script>
*/
