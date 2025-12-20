import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';

const ConnectionTest = () => {
  const [results, setResults] = useState({
    apiBaseUrl: '',
    socketUrl: '',
    backendHealth: null,
    backendRoot: null,
    error: null,
  });

  useEffect(() => {
    const testConnection = async () => {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'NOT SET';
      const sockUrl = import.meta.env.VITE_SOCKET_URL || 'NOT SET';

      setResults(prev => ({
        ...prev,
        apiBaseUrl: apiUrl,
        socketUrl: sockUrl,
      }));

      // Test 1: Backend root endpoint
      try {
        const rootResponse = await fetch(`${apiUrl}/`);
        const rootData = await rootResponse.json();
        setResults(prev => ({ ...prev, backendRoot: rootData }));
      } catch (err) {
        setResults(prev => ({ ...prev, error: `Root endpoint failed: ${err.message}` }));
      }

      // Test 2: Health endpoint
      try {
        const healthResponse = await fetch(`${apiUrl}/health`);
        const healthData = await healthResponse.json();
        setResults(prev => ({ ...prev, backendHealth: healthData }));
      } catch (err) {
        setResults(prev => ({ ...prev, error: `Health check failed: ${err.message}` }));
      }

      // Test 3: API Client (with CORS)
      try {
        const response = await apiClient.get('/auth/me');
        console.log('API Client test:', response.data);
      } catch (err) {
        console.log('API Client test failed (expected if not logged in):', err.message);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔧 Connection Test Page</h1>
      
      <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Environment Variables:</h2>
        <p><strong>VITE_API_BASE_URL:</strong> {results.apiBaseUrl}</p>
        <p><strong>VITE_SOCKET_URL:</strong> {results.socketUrl}</p>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#e8f5e9', borderRadius: '8px' }}>
        <h2>Backend Root (/):</h2>
        <pre>{JSON.stringify(results.backendRoot, null, 2)}</pre>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '8px' }}>
        <h2>Backend Health (/health):</h2>
        <pre>{JSON.stringify(results.backendHealth, null, 2)}</pre>
      </div>

      {results.error && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#ffebee', borderRadius: '8px', color: 'red' }}>
          <h2>❌ Error:</h2>
          <p>{results.error}</p>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3e0', borderRadius: '8px' }}>
        <h2>📋 What to check:</h2>
        <ul>
          <li>✅ If you see backend data above, your connection works!</li>
          <li>❌ If you see errors, check:</li>
          <ul>
            <li>Render backend is running (not sleeping)</li>
            <li>CLIENT_URL on Render matches your Vercel domain EXACTLY</li>
            <li>VITE_API_BASE_URL points to your Render URL</li>
            <li>Check browser console for CORS errors</li>
          </ul>
        </ul>
      </div>
    </div>
  );
};

export default ConnectionTest;
