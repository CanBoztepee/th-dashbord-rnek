const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const ActiveDirectory = require('activedirectory2');

const app = express();
const PORT = 3000;



const ad = new ActiveDirectory(config);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));


// Tüm kullanıcıları listele (belirli özelliklerle)
app.get('/users', (req, res) => {
  ad.findUsers((err, users) => {
    if (err) {
      console.error('❌ AD kullanıcı çekme hatası:', err);
      return res.status(500).json({ error: 'AD hatası' });
    }

    if (!users || !Array.isArray(users) || users.length === 0) {
      console.warn('⚠️ AD kullanıcı listesi boş');
      return res.json([]); // Boş array döner ama hata yok
    }

    const cleaned = users.map(user => ({
      name: user.displayName || user.cn || 'İsimsiz',
      username: user.sAMAccountName || '',
      email: user.mail || ''
    }));

    return res.json(cleaned); // ❗️ Tek bir çıkış noktası
  });
});





// Bağlantı test kodu (kullanıcı adı sabit test içindir)
ad.findUser('oparlak', (err, user) => {
  if (err) {
    console.error('❌ AD bağlantısı başarısız:', err);
  } else if (!user) {
    console.log('⚠️ Kullanıcı bulunamadı');
  } else {
    console.log('✅ Bağlantı başarılı! Kullanıcı bulundu:', user.displayName);
  }
});


app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
