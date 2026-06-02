const TP_TOKEN = '01cb30bd47eb8a8ca8d27cbcd2254f90';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { from, to, date } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: 'from va to kerak' });
  }

  // v2 API - eng ishonchli
  const url = `https://api.travelpayouts.com/v2/prices/latest?origin=${from}&destination=${to}&period_type=month&page=1&limit=10&show_to_affiliates=true&sorting=price&trip_class=0&token=${TP_TOKEN}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.data && data.data.length > 0) {
      // v2 returns array format
      const flights = data.data.map(item => ({
        airline: item.airline,
        price: item.price,
        departure_at: item.departure_at,
        return_at: item.return_at,
        transfers: item.transfers,
        duration: item.duration,
        origin: item.origin,
        destination: item.destination,
      }));
      return res.status(200).json({ success: true, flights });
    }

    // fallback: v1 cheap
    const url2 = `https://api.travelpayouts.com/v1/prices/cheap?origin=${from}&destination=${to}&currency=uzs&token=${TP_TOKEN}`;
    const r2 = await fetch(url2);
    const d2 = await r2.json();

    if (d2.data && Object.keys(d2.data).length > 0) {
      const dest = d2.data[to] || d2.data[Object.keys(d2.data)[0]];
      const flights = Object.entries(dest).map(([airline, info]) => ({
        airline,
        price: info.price,
        departure_at: info.departure_at,
        return_at: info.return_at,
        transfers: info.transfers,
        duration: info.duration,
        origin: from,
        destination: to,
      }));
      return res.status(200).json({ success: true, flights });
    }

    return res.status(200).json({ success: false, flights: [] });

  } catch (e) {
    return res.status(200).json({ success: false, flights: [], error: e.message });
  }
}
