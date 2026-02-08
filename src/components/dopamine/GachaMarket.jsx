import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Hexagon, Lock, Unlock, Cpu, Database, X, Trash2, Plus, Zap } from 'lucide-react';
import { clsx } from 'clsx';
import useMarketStore from '../../store/marketStore';

export const GachaMarket = () => {
  const { points, shopItems, buyLotteryTicket, inventory, useInventoryItem, addShopItem, removeShopItem } = useMarketStore();
  
  // --- STATE ---
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reward, setReward] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  
  // Refs for loop
  const requestRef = useRef();
  const prismControls = useAnimation();

  // --- LOGIC: HOLD TO DECRYPT ---
  const startCharge = () => {
    if (points < 100 || reward) return;
    setIsHolding(true);
  };

  const endCharge = () => {
    setIsHolding(false);
    if (progress < 100) {
      setProgress(0); // Reset if released early
    }
  };

  // The "Game Loop" for charging
  useEffect(() => {
    const animate = () => {
      if (isHolding && progress < 100) {
        setProgress(prev => {
          const next = prev + 2; // Speed of charging
          if (next >= 100) {
            triggerUnlock();
            return 100;
          }
          return next;
        });
        requestRef.current = requestAnimationFrame(animate);
      } else if (!isHolding && progress > 0 && progress < 100) {
        // Decay progress rapidly if released
        setProgress(prev => Math.max(0, prev - 5));
        requestRef.current = requestAnimationFrame(animate);
      }
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isHolding, progress]);

  // --- TRIGGER REWARD ---
  const triggerUnlock = () => {
    setIsHolding(false);
    
    // 1. Logic
    const result = buyLotteryTicket(100);
    if (!result.success) return;

    // 2. Haptic
    if (navigator.vibrate) navigator.vibrate([50, 50, 200]);

    // 3. Animation
    const item = result.item;
    setReward(item);
    
    // Explosion Effect
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#06b6d4', '#ec4899', '#ffffff'] // Cyberpunk Colors
    });
  };

  const resetMarket = () => {
    setReward(null);
    setProgress(0);
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] text-cyan-50 font-mono relative overflow-hidden">
      
      {/* --- BACKGROUND GRID --- */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#050505] to-transparent z-10" />

      {/* --- HEADER --- */}
      <div className="flex justify-between items-start p-6 z-20">
        <div>
          <h1 className="text-xl font-black tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            CYBER_MARKET
          </h1>
          <div className="flex items-center gap-2 text-[10px] text-cyan-700">
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
            SYSTEM ONLINE
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-2xl font-bold leading-none text-white">{points}</div>
            <div className="text-[9px] text-gray-500 uppercase tracking-widest">CREDITS</div>
          </div>
          <button onClick={() => setShowAdmin(!showAdmin)} className="p-2 opacity-50 hover:opacity-100">
            <Database size={16} />
          </button>
        </div>
      </div>

      {/* --- ADMIN PANEL --- */}
      <AnimatePresence>
        {showAdmin && (
          <motion.div 
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="px-6 overflow-hidden z-30"
          >
            <ShopAdminPanel onClose={() => setShowAdmin(false)} onAdd={addShopItem} items={shopItems} onRemove={removeShopItem} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN STAGE: THE DECRYPTER --- */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        
        {/* REWARD OVERLAY (Success State) */}
        <AnimatePresence>
          {reward && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]/90 backdrop-blur-xl z-50 p-6 text-center"
            >
              <div className="w-24 h-24 bg-cyan-500/20 rounded-full flex items-center justify-center border-2 border-cyan-400 mb-6 shadow-[0_0_50px_rgba(6,182,212,0.4)]">
                <Unlock size={48} className="text-cyan-300" />
              </div>
              <h2 className="text-3xl font-black italic text-white mb-2">{reward.name}</h2>
              <p className="text-cyan-600 font-mono text-xs mb-8">DECRYPTION SUCCESSFUL</p>
              
              <button 
                onClick={resetMarket}
                className="px-8 py-3 bg-white text-black font-bold text-sm tracking-widest uppercase hover:bg-cyan-400 transition-colors skew-x-[-10deg]"
              >
                ACCESS_INVENTORY
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* IDLE / CHARGING STATE */}
        <div className="relative w-64 h-64 flex items-center justify-center">
           {/* Spinning Rings */}
           <motion.div 
             animate={{ rotate: isHolding ? 360 : 10 }}
             transition={{ duration: isHolding ? 1 : 10, ease: "linear", repeat: Infinity }}
             className="absolute inset-0 border border-cyan-900 rounded-full border-dashed"
           />
           <motion.div 
             animate={{ rotate: isHolding ? -360 : -10 }}
             transition={{ duration: isHolding ? 1.5 : 15, ease: "linear", repeat: Infinity }}
             className="absolute inset-4 border border-blue-900 rounded-full opacity-50"
           />

           {/* Central Prism */}
           <motion.div
             animate={isHolding ? { scale: [1, 0.95, 1.05, 1], x: [0, -2, 2, 0] } : { y: [0, -10, 0] }}
             transition={isHolding ? { duration: 0.2, repeat: Infinity } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
             className="relative z-10"
           >
              <Hexagon size={100} className={clsx("transition-colors duration-300", isHolding ? "text-cyan-400 fill-cyan-900/20" : "text-gray-800 fill-gray-900")} strokeWidth={1} />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Lock size={32} className={clsx("transition-all duration-300", isHolding ? "text-cyan-200" : "text-gray-700")} />
              </div>
           </motion.div>

           {/* Progress Ring */}
           <svg className="absolute inset-[-20px] w-[calc(100%+40px)] h-[calc(100%+40px)] rotate-[-90deg]">
             <circle cx="50%" cy="50%" r="48%" fill="transparent" stroke="#1e293b" strokeWidth="4" />
             <motion.circle 
               cx="50%" cy="50%" r="48%" fill="transparent" stroke="#06b6d4" strokeWidth="4"
               strokeDasharray="300"
               strokeDashoffset={300 - (300 * progress) / 100}
               strokeLinecap="round"
             />
           </svg>
        </div>

        {/* HOLD BUTTON */}
        <div className="mt-12 w-full max-w-xs px-6">
           <button
             onMouseDown={startCharge}
             onMouseUp={endCharge}
             onTouchStart={startCharge}
             onTouchEnd={endCharge}
             disabled={points < 100}
             className={clsx(
               "w-full h-16 relative overflow-hidden font-bold tracking-widest text-sm transition-all border border-cyan-900 bg-gray-900 group select-none",
               points < 100 ? "opacity-50 cursor-not-allowed" : "hover:border-cyan-500 active:scale-95"
             )}
           >
             {/* Fill Effect */}
             <div 
               className="absolute inset-0 bg-cyan-900/50 transition-all duration-75 ease-linear origin-left" 
               style={{ width: `${progress}%` }}
             />
             
             <span className="relative z-10 flex items-center justify-center gap-2">
               {progress > 0 ? "DECRYPTING..." : "HOLD TO DECRYPT [100]"}
             </span>
           </button>
           <p className="text-center text-[9px] text-gray-600 mt-2 font-mono">SECURE CONNECTION ESTABLISHED</p>
        </div>

      </div>

      {/* --- INVENTORY GRID --- */}
      <div className="h-32 border-t border-gray-900 bg-black/50 backdrop-blur-md overflow-x-auto">
        <div className="flex items-center h-full px-6 gap-4">
           {inventory.length === 0 ? (
             <span className="text-xs text-gray-700 font-mono">NO DATA FRAGMENTS FOUND</span>
           ) : (
             inventory.map(item => (
               <InventoryChip key={item.id} item={item} onUse={useInventoryItem} />
             ))
           )}
        </div>
      </div>

    </div>
  );
};

// --- COMPONENT: INVENTORY CHIP ---
const InventoryChip = ({ item, onUse }) => (
  <button 
    onClick={() => onUse(item.id)}
    className="shrink-0 w-24 h-24 bg-gray-900 border border-gray-800 hover:border-cyan-500 hover:bg-gray-800 transition-all flex flex-col items-center justify-center p-2 group relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-cyan-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
    <Cpu size={20} className="text-gray-600 group-hover:text-cyan-400 mb-2 transition-colors" />
    <span className="text-[10px] text-gray-400 font-bold text-center leading-tight line-clamp-2 group-hover:text-white relative z-10">
      {item.name}
    </span>
  </button>
);

// --- COMPONENT: ADMIN PANEL ---
const ShopAdminPanel = ({ onClose, onAdd, items, onRemove }) => {
  const [name, setName] = useState('');
  
  const handleAdd = () => {
    if (!name) return;
    onAdd({ name, desireLevel: 5 });
    setName('');
  };

  return (
    <div className="bg-gray-900 border border-gray-800 p-4 mb-4">
      <div className="flex gap-2 mb-4">
        <input 
          value={name} onChange={e => setName(e.target.value)}
          placeholder="NEW_REWARD_NAME"
          className="flex-1 bg-black border border-gray-800 text-xs p-2 text-white outline-none focus:border-cyan-500"
        />
        <button onClick={handleAdd} className="bg-cyan-900/50 text-cyan-400 p-2 hover:bg-cyan-800"><Plus size={16} /></button>
      </div>
      <div className="space-y-1">
        {items.map(i => (
           <div key={i.id} className="flex justify-between items-center text-[10px] text-gray-500 bg-black p-2 border border-gray-900">
             {i.name}
             <button onClick={() => onRemove(i.id)} className="hover:text-red-500"><Trash2 size={12} /></button>
           </div>
        ))}
      </div>
    </div>
  );
};