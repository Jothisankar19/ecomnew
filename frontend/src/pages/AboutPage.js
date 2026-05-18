import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Seo from '../components/ui/Seo';
import { FiHeart, FiAward, FiCompass, FiShield, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';

// Inline ScrollStitchDivider for visually sewing the about sections together
const ScrollStitchDivider = ({ text = "Crafting Heritage" }) => {
  const containerRef = useRef(null);
  const [stitchProgress, setStitchProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const entryPoint = rect.top - windowHeight;
      const totalDistance = windowHeight * 0.85;
      
      if (rect.top < windowHeight && rect.bottom > 0) {
        const progress = Math.min(Math.max(-entryPoint / totalDistance, 0), 1);
        setStitchProgress(progress * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    setTimeout(handleScroll, 100);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full py-4 overflow-hidden bg-transparent select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative h-6 flex items-center">
        <div className="absolute left-4 right-4 h-[1px] bg-yellow-800/10" />
        <div className="absolute left-4 right-4 h-[2px] border-t border-dotted border-yellow-800/20" />
        <div 
          className="absolute left-4 h-0 border-t-2 border-dashed border-yellow-600 transition-all duration-75 ease-out shadow-[0_0_8px_rgba(217,119,6,0.15)]"
          style={{ width: `calc(${stitchProgress}% - 28px)` }}
        />
        <div 
          className="absolute transition-all duration-75 ease-out flex items-center"
          style={{ 
            left: `calc(16px + ${stitchProgress}%)`, 
            transform: 'translateY(-50%)', 
            top: '50%',
            opacity: stitchProgress > 0 && stitchProgress < 100 ? 1 : 0.9
          }}
        >
          <svg 
            className="w-10 h-6 text-yellow-600 -rotate-[15deg] drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]" 
            viewBox="0 0 40 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0,12 C4,10 6,14 10,12" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2,2" fill="none" />
            <path d="M10,12 L34,12 L39,11.5 L34,11 L10,11 Z" fill="currentColor" />
            <ellipse cx="13" cy="11.5" rx="1.8" ry="0.6" fill="#FAF6EE" />
          </svg>
          <span className="text-[8px] uppercase tracking-[0.25em] text-yellow-600/50 ml-3 font-mono hidden sm:inline whitespace-nowrap bg-yellow-500/5 border border-yellow-500/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {text}
          </span>
        </div>
      </div>
    </div>
  );
};

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <Seo 
        title="About Us"
        description="Discover Kurti Elegance. Learn about our commitment to Indian artisanal preservation, pure organic handloom fabrics, block prints, and bespoke tailored fits."
        keywords="about kurti elegance, handmade kurtis, indian traditional wear craft, organic cotton kurtis, fair trade ethnicwear artisans"
      />

      {/* ── HERO BANNER ── */}
      <section className="relative pt-32 pb-20 bg-products-motif overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-transparent pointer-events-none" />
        <div className="page-container relative z-10 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-extrabold uppercase tracking-[0.25em] text-yellow-600 bg-yellow-500/10 border border-yellow-500/20 px-3.5 py-1.5 rounded-full backdrop-blur-sm inline-block mb-4"
          >
            Our Story
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-gray-800 leading-tight mb-6 max-w-4xl mx-auto"
          >
            The Thread of Tradition, <br />
            <span className="font-semibold text-yellow-600">Sewn for Modern Elegance.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed mb-8"
          >
            Preserving India's ancient woodblock-printing, natural-dyeing, and handloom weaving heritage through beautifully tailored ethnic wear.
          </motion.p>
        </div>
      </section>

      <ScrollStitchDivider text="Origin & Heritage" />

      {/* ── OUR ORIGIN STORY ── */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image side with luxury border spools */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-3xl aspect-[4/5] shadow-2xl border border-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80" 
                  alt="Tailoring craftsmanship spools and handloom fabric details" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              {/* Luxury Badge overlay */}
              <div className="absolute -bottom-6 -right-6 bg-yellow-600 text-white rounded-3xl p-6 shadow-xl border border-yellow-500/20 max-w-xs hidden sm:block">
                <p className="font-serif text-2xl font-bold mb-1">100%</p>
                <p className="text-xs uppercase tracking-wider text-yellow-100 font-bold">Artisan Handcrafted</p>
                <p className="text-[10px] text-yellow-200/80 font-light mt-1.5 leading-relaxed">
                  Every wooden print block carved by hand; every stitch meticulously tailored to flatter.
                </p>
              </div>
            </motion.div>

            {/* Narrative side */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-6"
            >
              <span className="text-yellow-600 font-serif text-lg italic tracking-wide">Honoring the Maker, Dressing the Modern Woman.</span>
              <h2 className="font-serif text-3xl sm:text-4xl text-gray-800 font-bold leading-tight">
                Empowering Craftsmanship <br />Since Day One
              </h2>
              <div className="w-12 h-[3px] bg-yellow-500 rounded-full mb-2" />
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-light">
                Founded as a humble collaborative workshop in Jaipur, <strong>Kurti Elegance</strong> emerged from a single, vital mission: to revive the fading heritage of classic Indian block prints and handloom weavers while crafting elegant everyday silhouettes for the modern woman.
              </p>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-light">
                Instead of mass-producing synthetic garments, we seek out the finest master weavers in Rajasthan and Madhya Pradesh. We preserve regional block carving, natural botanical dyeing, and traditional Chikankari and Zardozi needlework. By choosing natural organic cottons and pure mulberry silks, we deliver breathable garments designed to drape you in sublime comfort.
              </p>
              <div className="grid grid-cols-2 gap-6 mt-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0">
                    <FiCompass size={20} />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-gray-800 text-sm">Jaipur Roots</h4>
                    <p className="text-xs text-gray-400 font-light mt-0.5">Authentic block print source</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0">
                    <FiUsers size={20} />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-gray-800 text-sm">Artisan Families</h4>
                    <p className="text-xs text-gray-400 font-light mt-0.5">Supporting 50+ master craftspeople</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <ScrollStitchDivider text="Brand Values & Core Pillars" />

      {/* ── CORE PILLARS ── */}
      <section className="py-16 bg-gray-50/50">
        <div className="page-container">
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400">Our Pillars</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-800 mt-2">What We Stand For</h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto font-light mt-3">We balance heritage preservation with uncompromising sustainable standards.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <FiHeart className="text-pink-500" size={24} />,
                title: 'Sustainable Luxury',
                desc: 'We strictly reject polyester, nylon, and harmful synthetic blends. Our kurtis are made from 100% certified organic cotton, premium handloom linen, and mulberry silk dyed with non-toxic botanical colors that are skin and earth-friendly.'
              },
              {
                icon: <FiAward className="text-yellow-600" size={24} />,
                title: 'Artisanal Preservation',
                desc: 'Every block-print motif on our kurtis is printed with handcarved teakwood blocks. We keep the ancient craft of hand block-printing alive by providing fair wages, healthy workshop environments, and long-term security to local artisans.'
              },
              {
                icon: <FiShield className="text-purple-500" size={24} />,
                title: 'Bespoke Tailoring Fit',
                desc: 'We believe ethnic wear should feel like a second skin. Our master tailors ensure highly structured armholes, hand-locked reinforced seams, and custom size tailoring options so you can experience a bespoke, luxurious drape.'
              }
            ].map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl p-8 border border-gray-100 hover:border-yellow-500/20 shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {p.icon}
                </div>
                <h3 className="font-serif text-lg font-bold text-gray-800 mb-3">{p.title}</h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-light">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <ScrollStitchDivider text="Tailoring & Creation Process" />

      {/* ── THE ARTISAN PROCESS ── */}
      <section className="py-16 bg-white">
        <div className="page-container">
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400">The Journey</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-800 mt-2">Crafted In Jaipur Workshops</h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto font-light mt-3">From raw loom-spun fabric spools to your finished boutique package, trace our careful, five-step craft process.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { step: '01', title: 'Loom Weaving', desc: 'Raw organic cotton threads are spun on traditional village handlooms to create our signature breathable fabric spools.' },
              { step: '02', title: 'Block Carving', desc: 'Craftsmen spend days hand-carving intricate slanted floral and leaf motifs into solid blocks of seasoned teakwood.' },
              { step: '03', title: 'Hand Stamping', desc: 'Artisans stamp fabric with the block on standard layout tables, achieving beautiful organic prints.' },
              { step: '04', title: 'Artisan Stitch', desc: 'Master tailors cut and stitch every panel with clean seams, reinforced margins, and structured alignments.' },
              { step: '05', title: 'Bespoke Pack', desc: 'Each kurti is thoroughly steam-ironed, hand-wrapped in organic muslin dustbags, and sent to your doorstep.' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-500/10 rounded-3xl p-6 flex flex-col items-start gap-4 transition-all duration-300"
              >
                <span className="font-serif text-3xl font-bold text-yellow-600/30">{s.step}</span>
                <div>
                  <h4 className="font-serif font-bold text-gray-800 text-sm mb-1">{s.title}</h4>
                  <p className="text-gray-500 text-[11px] leading-relaxed font-light">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION SECTION ── */}
      <section className="py-20 bg-products-motif text-center relative overflow-hidden border-t border-yellow-500/10">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/40 pointer-events-none" />
        <div className="page-container relative z-10">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-gray-800 mb-6">
            Drape Yourself in <span className="font-semibold text-yellow-600">Sublime Ethnic Craft.</span>
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base max-w-lg mx-auto font-light leading-relaxed mb-8">
            Experience our tailored collection — fitted, breathable, and crafted to last generations.
          </p>
          <Link 
            to="/products" 
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-bold tracking-widest uppercase text-xs px-8 py-3.5 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-98 transition-all duration-300"
          >
            Explore Collections
          </Link>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
