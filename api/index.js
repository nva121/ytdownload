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

  // Bersihin URL dari parameter aneh-aneh (?si=)
  url = url.split('?')[0]; 

  try {
    // BACKUP PLAN 1: API Siputzx
    try {
      const res1 = await axios.get(`https://api.siputzx.my.id/api/d/yt${format}?url=${url}`);
      if (res1.data && res1.data.data && res1.data.data.dl) {
        return res.status(200).json({
          title: res1.data.data.title || 'Download Siap!',
          format: format,
          download: res1.data.data.dl
        });
      }
    } catch (e) {
      // Kalau gagal, lanjut ke plan 2
    }

    // BACKUP PLAN 2: API Ryzendesu
    try {
      const res2 = await axios.get(`https://api.ryzendesu.vip/api/downloader/yt${format}?url=${url}`);
      if (res2.data && res2.data.url) {
        return res.status(200).json({
          title: res2.data.title || 'Download Siap!',
          format: format,
          download: res2.data.url
        });
      }
    } catch (e) {
      // Kalau gagal juga, lempar error ke bawah
    }

    // Kalau kedua API tepar
    throw new Error('Semua REST API publik lagi down');

  } catch (error) {
    return res.status(500).json({ error: 'Server penyedia lagi sibuk/down. Coba klik download sekali lagi.' });
  }
};
