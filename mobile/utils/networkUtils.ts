/**
 * Check if there's an active network connection
 * Returns true if connected, false otherwise
 */
export const isNetworkError = (error: any): boolean => {
  // Check for common network error patterns
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorString = error.toString().toLowerCase();
  
  // Common network error indicators
  const networkErrorPatterns = [
    'network request failed',
    'network error',
    'failed to fetch',
    'timeout',
    'connection refused',
    'econnrefused',
    'no internet',
    'offline',
    'unreachable',
  ];
  
  return networkErrorPatterns.some(pattern => 
    errorMessage.includes(pattern) || errorString.includes(pattern)
  );
};

/**
 * Wrapper for fetch with timeout and better error handling
 */
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = 10000
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Network request timed out. Please check your connection.');
    }
    
    throw error;
  }
};

/**
 * Retry a function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if it's not a network error
      if (!isNetworkError(error)) {
        throw error;
      }
      
      // Don't wait after the last attempt
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};
