const axios = require('axios');

module.exports = async (req, res) => {
  // Setup CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let { url, format } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  // Otomatis ngebersihin parameter tracking (?si=) dari URL YouTube
  url = url.split('?')[0]; 

  try {
    const response = await axios.post('https://co.wuk.sh/api/json', {
      url: url,
      isAudioOnly: format === 'mp3',
      aFormat: format === 'mp3' ? 'mp3' : 'best'
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    const data = response.data;
    
    if (data.status === 'error' || !data.url) {
      return res.status(500).json({ error: data.text || 'Video dibatasi atau API sedang sibuk.' });
    }
    
    return res.status(200).json({
      title: "Download Siap!",
      format: format || 'mp4',
      download: data.url
    });

  } catch (error) {
    // Biar lu bisa liat error aslinya di tab Logs Vercel
    console.error("API Error Details:", error.response ? error.response.data : error.message);
    return res.status(500).json({ error: 'Gagal koneksi ke server penyedia. Cek log Vercel.' });
  }
};
