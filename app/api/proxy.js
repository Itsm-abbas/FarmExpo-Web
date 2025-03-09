export default async function handler(req, res) {
  const backendUrl =
    "http://188.34.196.141:8080" + req.url.replace("/api/proxy", "");

  try {
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: { ...req.headers, host: "188.34.196.141:8080" },
      body: req.method !== "GET" ? JSON.stringify(req.body) : null,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ message: "Proxy error", error: error.message });
  }
}
