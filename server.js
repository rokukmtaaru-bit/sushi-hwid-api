const express = require('express');
const app = express();
app.use(express.json());

// 仮のデータ置き場（あとで本物のデータベースにします）
let data = { keys: {}, users: {} };

app.post('/api/auth', (req, res) => {
  const { key, hwid } = req.body;

  if (!key || !hwid) {
    return res.json({ success: false, reason: 'キーまたはHWIDがありません' });
  }

  const k = String(key).toUpperCase();

  if (!data.keys[k]) {
    return res.json({ success: false, reason: '無効なキーです' });
  }
  if (data.keys[k].invalidated) {
    return res.json({ success: false, reason: 'このキーは無効化されています' });
  }
  if (data.keys[k].expiresAt && new Date() > new Date(data.keys[k].expiresAt)) {
    return res.json({ success: false, reason: 'キーの有効期限が切れています' });
  }

  if (data.keys[k].used) {
    if (data.keys[k].hwid === hwid) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false, reason: 'このキーは別のHWIDで使用されています' });
    }
  }

  data.keys[k].used = true;
  data.keys[k].hwid = hwid;
  data.keys[k].firstUsedAt = new Date().toISOString();

  return res.json({ success: true, firstTime: true });
});

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('APIサーバー起動: port ' + PORT);
});
