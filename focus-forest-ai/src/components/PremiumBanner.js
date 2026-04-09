import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

function PremiumBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white px-4 py-3 relative overflow-hidden"
    >
      {/* 装饰背景 */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-10 w-20 h-20 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-32 h-32 bg-yellow-300 rounded-full blur-3xl" />
      </div>
      
      <div className="relative flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold text-sm md:text-base flex items-center gap-2">
              解锁完整森林体验
              <Sparkles className="w-4 h-4" />
            </p>
            <p className="text-white/90 text-xs md:text-sm">
              年会员 $29.99，无限树木+AI助手+深度统计
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            to="/premium"
            className="px-4 py-2 bg-white text-amber-600 rounded-lg font-semibold text-sm hover:bg-amber-50 transition-colors shadow-lg"
          >
            立即升级
          </Link>
          
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default PremiumBanner;
