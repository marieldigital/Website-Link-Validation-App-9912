import React from 'react';
import { motion } from 'framer-motion';
import LinkScanner from './components/LinkScanner';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          <LinkScanner />
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

export default App;