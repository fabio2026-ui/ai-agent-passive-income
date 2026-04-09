// Freelancer Bookkeeper API
// Cloudflare Worker

import { handleAuth } from './auth.js';
import { handleExpenses } from './expenses.js';
import { handleAI } from './ai.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      let response;

      // Routes
      if (path.startsWith('/api/auth')) {
        response = await handleAuth(request, env);
      } else if (path.startsWith('/api/expenses')) {
        response = await handleExpenses(request, env);
      } else if (path.startsWith('/api/ai')) {
        response = await handleAI(request, env);
      } else {
        response = new Response('Not Found', { status: 404 });
      }

      // Add CORS headers
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
};

// Auth handler
export async function handleAuth(request, env) {
  const url = new URL(request.url);
  
  if (url.pathname === '/api/auth/register' && request.method === 'POST') {
    const { email, password } = await request.json();
    // TODO: Implement registration
    return new Response(JSON.stringify({ success: true, message: 'User registered' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (url.pathname === '/api/auth/login' && request.method === 'POST') {
    const { email, password } = await request.json();
    // TODO: Implement login
    return new Response(JSON.stringify({ success: true, token: 'jwt-token-here' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Not Found', { status: 404 });
}

// Expenses handler
export async function handleExpenses(request, env) {
  const url = new URL(request.url);
  
  if (url.pathname === '/api/expenses' && request.method === 'GET') {
    // TODO: Get expenses from DB
    return new Response(JSON.stringify({ expenses: [] }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (url.pathname === '/api/expenses' && request.method === 'POST') {
    const data = await request.json();
    // TODO: Save expense to DB
    return new Response(JSON.stringify({ success: true, id: 'exp-123' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Not Found', { status: 404 });
}

// AI handler
export async function handleAI(request, env) {
  const url = new URL(request.url);
  
  if (url.pathname === '/api/ai/categorize' && request.method === 'POST') {
    const { description, amount } = await request.json();
    
    // TODO: Call DeepSeek API
    const categories = ['Software', 'Hardware', 'Travel', 'Meals', 'Office', 'Marketing'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    return new Response(JSON.stringify({ category, confidence: 0.95 }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response('Not Found', { status: 404 });
}