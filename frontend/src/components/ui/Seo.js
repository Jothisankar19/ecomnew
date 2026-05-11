import React from 'react';
import { Helmet } from 'react-helmet-async';

const Seo = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  schema 
}) => {
  const siteName = 'Kurti Elegance';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const siteUrl = 'https://kurtielegance.com'; // Replace with actual domain
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const defaultImage = `${siteUrl}/og-image.jpg`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image || defaultImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image || defaultImage} />

      {/* Canonical Link */}
      <link rel="canonical" href={fullUrl} />

      {/* Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default Seo;
