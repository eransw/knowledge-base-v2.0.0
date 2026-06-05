import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

export const useMediaUrl = (attachmentId, type = 'download') => {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let currentUrl = null;
    
    const fetchAndSetUrl = async () => {
      if (!attachmentId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const token = localStorage.getItem('token');
        const endpoint = type === 'preview' ? 'preview' : 'download';
        
        const response = await axios.get(`/api/documents/${endpoint}/${attachmentId}`, {
          responseType: 'blob',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        currentUrl = window.URL.createObjectURL(response.data);
        setUrl(currentUrl);
      } catch (err) {
        console.error('Failed to fetch media:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAndSetUrl();
    
    return () => {
      if (currentUrl) {
        window.URL.revokeObjectURL(currentUrl);
      }
    };
  }, [attachmentId, type]);

  const refresh = useCallback(async () => {
    if (!attachmentId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'preview' ? 'preview' : 'download';
      
      const response = await axios.get(`/api/documents/${endpoint}/${attachmentId}`, {
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const blobUrl = window.URL.createObjectURL(response.data);
      setUrl(blobUrl);
    } catch (err) {
      console.error('Failed to fetch media:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [attachmentId, type]);

  return { url, loading, error, refresh };
};

export default useMediaUrl;