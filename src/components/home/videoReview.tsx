'use client'

import { useEffect } from 'react';

export default function VideoReview() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://widget.tagembed.com/embed.min.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <div 
        className="tagembed-widget" 
        style={{ width: '100%', height: '100%' }} 
        data-widget-id="2159799" 
        data-tags="false" 
        data-view-url="https://widget.tagembed.com/2159799"
      >
      </div>
    </>
  );
}