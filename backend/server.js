require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const schedule = require('node-schedule');
const ActiveDirectory = require('activedirectory2');

const app = express();
const PORT = 3000;

const config = {
  url: process.env.AD_URL,
  baseDN: process.env.AD_BASE_DN,
  username: process.env.AD_USERNAME,
  password: process.env.AD_PASSWORD
};


const ad = new ActiveDirectory(config);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));


// Tüm kullanıcıları listele (belirli özelliklerle)
// Tüm kullanıcıları listele (aktif + deaktif)
app.get('/users', (req, res) => {
  const opts = {
    filter: '(&(objectCategory=person)(objectClass=user))',
    scope: 'sub',
    paged: true,
    attributes: ['displayName', 'cn', 'sAMAccountName', 'mail', 'userAccountControl']
  };

  ad.find(opts, (err, results) => {
    if (err) {
      console.error('❌ AD kullanıcı çekme hatası:', err);
      return res.status(500).json({ error: 'AD hatası' });
    }

    const users = results.users || [];
    console.log(`📥 AD'den gelen toplam kullanıcı sayısı: ${users.length}`);

    users.sort((a, b) => {
      const nameA = (a.displayName || a.cn || '').toLowerCase();
      const nameB = (b.displayName || b.cn || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

    const cleaned = users.map(user => ({
      name: user.displayName || user.cn || 'İsimsiz',
      username: user.sAMAccountName || '',
      email: user.mail || '',
      disabled: (user.userAccountControl & 2) === 2 // frontend ayırmak isterse diye
    }));

    return res.json(cleaned);
  });
});


app.get('/users/:username', (req, res) => {
  const username = req.params.username;

  const opts = {
    filter: `(&(objectCategory=person)(objectClass=user)(sAMAccountName=${username}))`,
    attributes: ['displayName', 'cn', 'sAMAccountName', 'mail', 'title', 'department', 'telephoneNumber']
  };

  ad.find(opts, (err, results) => {
    if (err) {
      console.error('❌ AD kullanıcı detayı hatası:', err);
      return res.status(500).json({ error: 'AD hatası' });
    }

    const user = results.users && results.users[0];
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const cleaned = {
      name: user.displayName || user.cn || 'İsimsiz',
      username: user.sAMAccountName || '',
      email: user.mail || '',
      title: user.title || '',
      department: user.department || '',
      phone: user.telephoneNumber || ''
    };

    return res.json(cleaned);
  });
});







app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
