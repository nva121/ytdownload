const ytdl = require('@distube/ytdl-core');

module.exports = async (req, res) => {
  // 1. Setup CORS biar frontend bisa request
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, format, action } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // 2. Validasi URL
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Format URL YouTube tidak valid' });
    }

    // 3. Mode Streaming (Trigger saat browser klik tombol download)
    if (action === 'stream') {
      const info = await ytdl.getInfo(url);
      // Bersihkan karakter aneh dari judul biar ga error pas disave
      const title = info.videoDetails.title.replace(/[^\w\s-]/gi, ''); 
      
      const isMp3 = format === 'mp3';
      const formatOptions = isMp3 
        ? { quality: 'highestaudio', filter: 'audioonly' } 
        : { quality: 'highest', filter: 'audioandvideo' };

      // Paksa browser buat download file-nya (attachment)
      res.setHeader('Content-Disposition', `attachment; filename="${title}.${isMp3 ? 'mp3' : 'mp4'}"`);
      res.setHeader('Content-Type', isMp3 ? 'audio/mpeg' : 'video/mp4');

      // Pipa stream dari YouTube -> Vercel -> Browser Client
      return ytdl(url, formatOptions).pipe(res);
    }

    // 4. Mode Info (Trigger pertama kali saat klik tombol di frontend)
    const info = await ytdl.getBasicInfo(url);
    
    // Bikin link download yang ngarah balik ke API ini sendiri, tapi ditambahin action=stream
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const streamUrl = `${protocol}://${host}/api/download?url=${encodeURIComponent(url)}&format=${format}&action=stream`;

    return res.status(200).json({
      id: info.videoDetails.videoId,
      title: info.videoDetails.title,
      format: format || 'mp3',
      download: streamUrl // Frontend bakal ngeklik link ini otomatis
    });

  } catch (error) {
    console.error("YTDL Error:", error);
    return res.status(500).json({ error: 'Gagal memproses video. Coba lagi.' });
  }
};
