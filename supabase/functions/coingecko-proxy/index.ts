/*
  # CoinGecko Proxy Edge Function

  1. Functionality
    - Acts as a secure proxy for CoinGecko API requests
    - Handles CORS issues from the frontend
    - Provides reliable data fetching without external proxies

  2. Usage
    - Frontend sends requests to this function
    - Function fetches data directly from CoinGecko API
    - Returns clean JSON response to frontend
*/

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');
    
    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing url parameter' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate that the target URL is from CoinGecko
    if (!targetUrl.includes('api.coingecko.com')) {
      return new Response(
        JSON.stringify({ error: 'Invalid target URL' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Fetching from CoinGecko:', targetUrl);
    
    const response = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MemeBot-Trading-App/1.0.3'
      }
    });

    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status} ${response.statusText}`);
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Successfully fetched data from CoinGecko');
    
    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in coingecko-proxy:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch data from CoinGecko',
        message: error.message,
        fallback: 'Using demo data instead'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});