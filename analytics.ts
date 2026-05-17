// analytics.ts

export const loadAnalytics = () => {
  // 1. Check if the script is already loaded so we don't load it twice
  if (document.getElementById('google-analytics-script')) return;

  // 2. Replace this with your actual Google Analytics Measurement ID
  const TRACKING_ID = 'G-X95Y8Z072K'; 

  // 3. Create the script tag dynamically
  const script = document.createElement('script');
  script.id = 'google-analytics-script';
  script.src = `https://www.googletagmanager.com/gtag/js?id=${TRACKING_ID}`;
  script.async = true;
  document.head.appendChild(script);

  // 4. Initialize the dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  
  // @ts-ignore
  window.gtag = gtag;
  
  // @ts-ignore
  window.gtag('js', new Date());
  // @ts-ignore
  window.gtag('config', TRACKING_ID);
  
  console.log("Analytics loaded successfully.");
};
