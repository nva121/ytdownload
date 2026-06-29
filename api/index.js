const ytdl = require('@distube/ytdl-core');

module.exports = async (req, res) => {
  // ... (setup CORS tetap sama kayak sebelumnya) ...

  const { url, format } = req.query;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    // Contoh nembak ke public API (misal Cobalt, dsb)
    // Lu harus cari dokumentasi API gratisan yang lagi aktif dan sesuaikan endpoint/body-nya
    const response = await fetch('URL_API_GRATISAN_DI_SINI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ url: url })
    });
    
    const data = await response.json();
    
    // Kirim balik link downloadnya ke frontend lu
    return res.status(200).json({
      title: "Video Download",
      format: format || 'mp4',
      download: data.url // Link direct download dari API tersebut
    });

  } catch (error) {
    return res.status(500).json({ error: 'API Error' });
  }
};
