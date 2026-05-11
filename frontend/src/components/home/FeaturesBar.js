import React from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi';

const features = [
  { icon: FiTruck, title: 'Free Shipping', desc: 'On orders above ₹999', color: 'text-blue-400' },
  { icon: FiShield, title: 'Secure Payment', desc: '100% secure transactions', color: 'text-green-400' },
  { icon: FiRefreshCw, title: 'Easy Returns', desc: '7-day return policy', color: 'text-yellow-400' },
  { icon: FiHeadphones, title: '24/7 Support', desc: 'Dedicated customer care', color: 'text-pink-400' },
];

const FeaturesBar = () => (
  <section className="py-8 border-y border-white/5">
    <div className="page-container">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl glass flex items-center justify-center ${f.color} flex-shrink-0`}>
              <f.icon size={22} />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{f.title}</p>
              <p className="text-white/40 text-xs">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesBar;
