const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Get the API key from environment variables
  const STEAM_API_KEY = process.env.STEAM_API_KEY;
  
  try {
    // Parse query parameters
    const params = event.queryStringParameters;
    const endpoint = params.endpoint;
    
    // Basic error handling
    if (!endpoint) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing endpoint parameter' })
      };
    }
    
    // Handle different API endpoints
    let url = '';
    switch(endpoint) {
      case 'featured':
        url = `https://api.steampowered.com/ISteamApps/GetFeaturedCategories/v1/?key=${STEAM_API_KEY}`;
        break;
      case 'appdetails':
        const appId = params.appid;
        if (!appId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Missing appid parameter' })
          };
        }
        url = `https://store.steampowered.com/api/appdetails?appids=${appId}`;
        break;
      case 'featuredgames':
        url = `https://api.steampowered.com/ISteamApps/GetFeaturedGames/v1/?key=${STEAM_API_KEY}`;
        break;
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid endpoint parameter' })
        };
    }
    
    // Fetch data from Steam API
    const response = await fetch(url);
    const data = await response.json();
    
    // Return API response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    // Handle errors
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'An error occurred fetching data from Steam API' })
    };
  }
};