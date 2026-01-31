let API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Ensure protocol is present
if (API_URL && !API_URL.startsWith('http')) {
    API_URL = `https://${API_URL}`;
}

// Remove trailing slash
if (API_URL && API_URL.endsWith('/')) {
    API_URL = API_URL.slice(0, -1);
}

export default API_URL;
