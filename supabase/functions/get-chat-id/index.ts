/*
  # Get Chat ID Function
  
  Esta función te ayuda a obtener tu Chat ID de Telegram
  enviando un mensaje a tu bot y obteniendo la respuesta.
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
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    const { botToken } = await req.json();
    
    if (!botToken) {
      throw new Error('Bot token is required');
    }

    // Get updates from Telegram to find the chat ID
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`);
    
    if (!response.ok) {
      throw new Error('Failed to get updates from Telegram');
    }

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error('Telegram API error: ' + data.description);
    }

    // Find the most recent message to get chat ID
    const updates = data.result;
    
    if (updates.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'No messages found. Please send a message to your bot first.',
          instructions: 'Go to your bot and send /start or any message, then try again.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get the chat ID from the most recent message
    const lastUpdate = updates[updates.length - 1];
    const chatId = lastUpdate.message?.chat?.id;
    const username = lastUpdate.message?.from?.username;
    const firstName = lastUpdate.message?.from?.first_name;

    if (!chatId) {
      throw new Error('Could not extract chat ID from updates');
    }

    return new Response(
      JSON.stringify({
        success: true,
        chatId: chatId.toString(),
        username: username || 'N/A',
        firstName: firstName || 'N/A',
        message: 'Chat ID found successfully!'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error getting chat ID:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});