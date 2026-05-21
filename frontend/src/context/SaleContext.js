import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const SaleContext = createContext({});

export const useSaleOffers = () => useContext(SaleContext);

// Get the best active sale offer for a specific product
export const useProductOffer = (productId) => {
  const offers = useContext(SaleContext);
  if (!productId || !offers) return null;
  return offers[productId] || null;
};

export const SaleProvider = ({ children }) => {
  const [offers, setOffers] = useState({});

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const { data } = await api.get('/flash-sales/product-offers');
        if (data.success && data.offers) {
          setOffers(data.offers);
        }
      } catch (err) {
        // Silently fail — no sale offers to show
        console.log('Sale offers unavailable');
      }
    };

    fetchOffers();

    // Refresh every 2 minutes to stay in sync with campaign changes
    const interval = setInterval(fetchOffers, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SaleContext.Provider value={offers}>
      {children}
    </SaleContext.Provider>
  );
};

export default SaleContext;
