const TP_TOKEN = '01cb30bd47eb8a8ca8d27cbcd2254f90';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { from, to, date } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: 'from va to kerak' });
  }

  const endpoints = [
    `https://api.travelpayouts.com/v2/prices/latest?origin=${from}&destination=${to}&period_type=month&page=1&limit=10&show_to_affiliates=true&sorting=price&trip_class=0&token=${TP_TOKEN}`,
    `https://api.travelpayouts.com/v1/prices/cheap?origin=${from}&destination=${to}&currency=uzs&token=${TP_TOKEN}`,
    `https://api.travelpayouts.com/v1/prices/direct?origin=${from}&destination=${to}&currency=uzs&token=${TP_TOKEN}`,
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.data && Object.keys(data.data).length > 0) {
        return res.status(200).json({ success: true, data: data.data });
      }
    } catch (e) {
      continue;
    }
  }

  return res.status(200).json({ success: false, data: {} });
}
