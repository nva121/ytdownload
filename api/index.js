module.exports = async (req, res) => {
  // Setup CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, format } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    // Kita tembak ke instance public Cobalt API
    const response = await fetch('https://co.wuk.sh/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url,
        isAudioOnly: format === 'mp3',
        aFormat: format === 'mp3' ? 'mp3' : 'best' // Format setting untuk Cobalt
      })
    });
    
    const data = await response.json();
    
    // Kalau API-nya nge-return error
    if (data.status === 'error' || !data.url) {
      return res.status(500).json({ error: data.text || 'Video dibatasi atau API sedang sibuk.' });
    }
    
    // Kirim balik link downloadnya ke frontend lu
    return res.status(200).json({
      title: "Download Siap!",
      format: format || 'mp4',
      download: data.url // Link direct download dari Cobalt
    });

  } catch (error) {
    return res.status(500).json({ error: 'Gagal koneksi ke server penyedia.' });
  }
};
