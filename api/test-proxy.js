/**
 * Test endpoint to verify proxy is working
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Test the actual API connection
    const response = await fetch('http://3.111.57.77:5000/vms/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'test',
        password: 'test'
      })
    });

    const data = await response.text();
    
    res.status(200).json({
      success: true,
      message: 'Proxy is working!',
      apiResponse: data,
      status: response.status
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Proxy test failed',
      error: error.message
    });
  }
}
