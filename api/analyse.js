export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { storeData } = req.body;
  const prompt = `You are ShopRecon AI. Analyse this Shopify store. Respond ONLY with valid JSON, no other text.
Store: ${storeData.hostname}
Products: ${storeData.totalProducts}
Apps: ${storeData.apps?.map(a=>a.name).join(', ')}
Price: $${storeData.priceRange?.min}-$${storeData.priceRange?.max}
Theme: ${storeData.theme?.name}
Return exactly this JSON structure:
{"score":7,"scoreSummary":"one sentence","winning":["point 1","point 2","point 3"],"gaps":["gap 1","gap 2","gap 3"],"opportunity":"specific opportunity text","marketing":"two sentence analysis","action":"one action starting with a verb"}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();
  const result = JSON.parse(data.content[0].text);
  res.json(result);
}
