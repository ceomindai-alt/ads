import { useEffect } from 'react';

export default function ExternalRedirect() {
  useEffect(() => {
    window.location.href = window.location.pathname; 
  }, []);

  return null;
}
