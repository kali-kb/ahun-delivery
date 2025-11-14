import { authClient } from './authClient';

/**
 * Authenticated fetch wrapper following Better Auth Expo documentation
 * Uses authClient.getCookie() to retrieve session cookies
 * @see https://www.better-auth.com/docs/integrations/expo#making-authenticated-requests-to-your-server
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  try {
    console.log('🔐 Auth Fetch Debug:');
    console.log('URL:', url);
    
    // Get cookies from authClient (recommended by Better Auth docs)
    const cookies = authClient.getCookie();
    
    console.log('Cookies from authClient:', cookies ? 'Present' : 'Missing');
    if (cookies) {
      console.log('Cookie preview:', cookies.substring(0, 50) + '...');
    }
    
    // Prepare headers
    const headers = new Headers(options.headers);
    
    // Add cookies to request headers if available
    if (cookies) {
      headers.set('Cookie', cookies);
      console.log('✅ Added Cookie header');
    } else {
      console.log('⚠️ No cookies available');
    }
    
    // Add content-type if not set and body exists
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Make the fetch request
    // Use 'omit' for credentials as recommended by Better Auth docs
    // because we're manually setting cookies in headers
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'omit', // Important: omit to avoid interfering with manual cookies
    });

    console.log('Response status:', response.status);
    if (response.status === 401) {
      console.log('❌ 401 - Authentication failed');
    }
    
    return response;
  } catch (error) {
    console.error('Authenticated fetch error:', error);
    throw error;
  }
}

/**
 * Helper for GET requests
 */
export async function apiGet(url: string): Promise<Response> {
  return authenticatedFetch(url, { method: 'GET' });
}

/**
 * Helper for POST requests
 */
export async function apiPost(url: string, data?: any): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Helper for PATCH requests
 */
export async function apiPatch(url: string, data?: any): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Helper for DELETE requests
 */
export async function apiDelete(url: string): Promise<Response> {
  return authenticatedFetch(url, { method: 'DELETE' });
}

/**
 * Helper for PUT requests
 */
export async function apiPut(url: string, data?: any): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}
