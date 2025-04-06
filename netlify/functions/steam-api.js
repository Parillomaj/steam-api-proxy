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
    const params = event.queryStringParameters || {};
    const endpoint = params.endpoint;
    
    // Basic error handling
    if (!endpoint) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing endpoint parameter' })
      };
    }
    
    if (!STEAM_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }
    
    // Handle different API endpoints
    let url = '';
    switch(endpoint) {
      case 'newreleases':
        // Get top selling games, which includes new releases
        url = `https://store.steampowered.com/api/featuredcategories/?key=${STEAM_API_KEY}`;
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
      case 'deals':
        // Get specials
        url = `https://store.steampowered.com/api/featuredcategories/?key=${STEAM_API_KEY}`;
        break;
      case 'featured':
        url = `https://store.steampowered.com/api/featured/?key=${STEAM_API_KEY}`;
        break;
      // In your switch statement, add this new case:
      case 'upcoming':
        url = `https://store.steampowered.com/api/featured/comingsoon/?key=${STEAM_API_KEY}`;
        break;
      case 'popularupcoming':
        url = `https://store.steampowered.com/api/featuredcategories`;
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
    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `Steam API returned ${response.status} status`,
          details: await response.text()
        })
      };
    }
    
    const data = await response.json();
    
    // Process the data based on endpoint
    let processedData = data;
    
    if (endpoint === 'newreleases') {
      // Extract new releases from the featured categories
      const newReleases = data.new_releases || data.top_sellers || {};
      processedData = {
        items: newReleases.items || []
      };
    } else if (endpoint === 'deals') {
      // Extract specials from the featured categories
      const specials = data.specials || {};
      processedData = {
        items: specials.items || []
      };
    }
    
    // Return API response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(processedData)
    };
  } catch (error) {
    console.error('Error in function:', error);
    // Handle errors
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'An error occurred fetching data from Steam API',
        details: error.message
      })
    };
  }
};