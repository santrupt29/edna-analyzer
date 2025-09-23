// LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen font-inter text-gray-900 overflow-x-hidden">
      <Header isScrolled={isScrolled} />
      <HeroSection />
      <FeaturesSection />
      <ProcessSection />
      <CTASection />
      <Footer />
    </div>
  );
};

// Header Component
const Header = ({ isScrolled }) => {
  return (
    <motion.header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/98 backdrop-blur-md shadow-lg border-b border-gray-200' 
          : 'bg-white/95 backdrop-blur-md border-b border-gray-100'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <motion.div 
            className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            BioTrace
          </motion.div>
          
          <nav className="hidden md:flex space-x-8">
            {['Features', 'How It Works', 'Research', 'Contact'].map((item, index) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '')}`}
                className="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-300 relative group"
                whileHover={{ y: -2 }}
              >
                {item}
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </motion.a>
            ))}
          </nav>
          
          <motion.button 
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

// Hero Section Component
const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234f46e5' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Revolutionizing Biodiversity Discovery with{' '}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                AI-Powered eDNA
              </span>
            </motion.h1>
            
            <motion.p
              className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Unlock the secrets of environmental DNA using cutting-edge machine learning algorithms. 
              Identify known species, discover new ones, and monitor ecosystem health with unprecedented precision and speed.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.button 
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Analysis
              </motion.button>
              <motion.button 
                className="border-2 border-indigo-600 text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-600 hover:text-white transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Watch Demo
              </motion.button>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-3 gap-8 max-w-md mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <StatItem number="10,000+" label="Species Identified" />
              <StatItem number="95%" label="Accuracy Rate" />
              <StatItem number="24hrs" label="Processing Time" />
            </motion.div>
          </motion.div>
          
          <motion.div 
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            <DNAVisualization />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// DNA Visualization Component
const DNAVisualization = () => {
  return (
    <div className="relative w-80 h-80 lg:w-96 lg:h-96">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
        <motion.div 
          className="w-48 h-48 lg:w-56 lg:h-56 relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 border-4 border-white/80 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-white/60 rounded-full transform rotate-45"></div>
          <div className="absolute inset-0 border-4 border-white/40 rounded-full transform rotate-90"></div>
        </motion.div>
        
        {/* DNA Particles */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-70"
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity
              }}
              style={{
                top: '50%',
                left: '50%',
                transform: `rotate(${i * 30}deg) translateX(100px) translateY(-50%)`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// Stat Item Component
const StatItem = ({ number, label }) => {
  return (
    <motion.div 
      className="text-center cursor-pointer"
      whileHover={{ scale: 1.05 }}
    >
      <div className="text-2xl lg:text-3xl font-bold text-indigo-600 mb-1">
        {number}
      </div>
      <div className="text-xs lg:text-sm text-gray-500 uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
};

// Features Section Component
const FeaturesSection = () => {
  const features = [
    {
      icon: '🧬',
      title: 'ML Classification',
      description: 'Advanced machine learning models trained on extensive genomic databases to classify species with exceptional accuracy and identify potential new discoveries.'
    },
    {
      icon: '🎯',
      title: 'Species Detection',
      description: 'Detect and identify both common and rare species from environmental samples using proprietary clustering algorithms and taxonomic classification systems.'
    },
    {
      icon: '🔍',
      title: 'Novel Discovery',
      description: 'Flag potential new species when classification parameters don\'t match existing databases, opening new frontiers in biodiversity research.'
    },
    {
      icon: '📊',
      title: 'Real-time Analytics',
      description: 'Interactive dashboards and comprehensive reports providing actionable insights for conservation efforts and ecosystem management.'
    },
    {
      icon: '🌍',
      title: 'Ecosystem Monitoring',
      description: 'Track biodiversity changes over time, monitor ecosystem health, and detect environmental impacts with temporal analysis capabilities.'
    },
    {
      icon: '⚡',
      title: 'High-Speed Processing',
      description: 'Process thousands of eDNA samples rapidly using optimized pipelines and cloud-based infrastructure for scalable analysis.'
    }
  ];

  return (
    <section className="py-20 lg:py-24 bg-gray-50" id="features">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Advanced eDNA Analysis Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powered by state-of-the-art machine learning and classification algorithms
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description, index }) => {
  return (
    <motion.div 
      className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer group"
      variants={{
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 }
      }}
      initial="initial"
      whileInView="animate"
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
    >
      <motion.div 
        className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300"
        whileHover={{ rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-semibold mb-4 text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

// Process Section Component
const ProcessSection = () => {
  const steps = [
    {
      number: '1',
      title: 'Sample Collection',
      description: 'Collect environmental samples from water, soil, or air using standardized protocols'
    },
    {
      number: '2',
      title: 'DNA Extraction',
      description: 'Extract and amplify eDNA using advanced metabarcoding techniques'
    },
    {
      number: '3',
      title: 'AI Analysis',
      description: 'Process sequences through our ML classification and clustering algorithms'
    },
    {
      number: '4',
      title: 'Species Report',
      description: 'Receive detailed biodiversity reports with species identification and insights'
    }
  ];

  return (
    <section className="py-20 lg:py-24" id="howitworks">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            How BioTrace Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From sample to species identification in four simple steps
          </p>
        </motion.div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {steps.map((step, index) => (
            <ProcessStep key={index} {...step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

// Process Step Component
const ProcessStep = ({ number, title, description, index }) => {
  return (
    <motion.div 
      className="text-center relative"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      viewport={{ once: true }}
    >
      {/* Connection Line */}
      {index < 3 && (
        <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gray-300 -translate-x-1/2 z-0"></div>
      )}
      
      <motion.div 
        className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6 shadow-lg relative z-10"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {number}
      </motion.div>
      <h4 className="text-xl font-semibold mb-4 text-gray-900">
        {title}
      </h4>
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

// CTA Section Component
const CTASection = () => {
  return (
    <section className="py-20 lg:py-24 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
      <motion.div 
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl lg:text-4xl font-bold mb-6">
          Ready to Transform Your Research?
        </h2>
        <p className="text-xl mb-10 opacity-95 leading-relaxed max-w-3xl mx-auto">
          Join leading researchers and conservation organizations using BioTrace to unlock biodiversity insights and advance environmental science.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button 
            className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
          <motion.button 
            className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Research
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  const footerSections = [
    {
      title: 'Platform',
      links: ['Features', 'Pricing', 'API Access', 'Documentation']
    },
    {
      title: 'Research',
      links: ['Publications', 'Case Studies', 'Datasets', 'Partnerships']
    },
    {
      title: 'Support',
      links: ['Contact Us', 'Help Center', 'Community', 'Training']
    }
  ];

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-1">
            <h4 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              BioTrace
            </h4>
            <p className="text-gray-400 leading-relaxed">
              Pioneering the future of biodiversity monitoring through AI-powered environmental DNA analysis.
            </p>
          </div>
          
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="text-lg font-semibold mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href="#" 
                      className="text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-400">
            &copy; 2025 BioTrace. All rights reserved. | Advancing biodiversity science through AI.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingPage;
