import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Lock, Unlock, Gift, Settings2, X, Plus, Trash2, Key, PackageOpen } from 'lucide-react';
import { clsx } from 'clsx';
import useMarketStore from '../../store/marketStore';

export const GachaMarket = () => {
  const { points, shopItems, buyLotteryTicket, inventory, useInventoryItem, addShopItem, removeShopItem } = useMarketStore();
  
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [reward, setReward] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  
  // Ref for auto-scrolling to new items
  const inventoryRef = useRef(null);

  // --- THE UNLOCKING RITUAL ---
  const handleUnlock = async () => {
    if (points < 100 || isUnlocking) return;

    setIsUnlocking(true);
    setReward(null); // Ensure clear state

    // 1. Backend Transaction
    const result = buyLotteryTicket(100);
    
    if (!result.success) {
      setIsUnlocking(false);
      return; 
    }

    // 2. Haptic Feedback
    if (navigator.vibrate) navigator.vibrate([30, 50, 30]); 

    // 3. Wait for Animation (Reduced time for snappiness)
    setTimeout(() => {
      setReward(result.item);
      setIsUnlocking(false);
      
      // 4. Success Effects (Triggered immediately upon reveal)
      const isRare = result.item.desireLevel > 7;
      triggerConfetti(isRare);
      if (navigator.vibrate) navigator.vibrate(isRare ? 300 : 100);
      
    }, 2000); // 2 seconds is the sweet spot
  };

  const triggerConfetti = (isRare) => {
    const colors = isRare 
      ? ['#FFD700', '#F59E0B', '#FFFFFF'] // Gold
      : ['#94A3B8', '#E2E8F0', '#FFFFFF']; // Silver
      
    confetti({
      particleCount: isRare ? 150 : 80,
      spread: 100,
      origin: { y: 0.6 },
      colors: colors,
      zIndex: 100 // Ensure it's on top
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#050505] text-white overflow-hidden relative font-sans selection:bg-amber-500/30">
      
      {/* --- AMBIENT LIGHTING --- */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-[800px] aspect-square bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black via-[#0a0a0a] to-transparent pointer-events-none z-0" />

      {/* --- HEADER --- */}
      <header className="px-6 py-6 flex justify-between items-start shrink-0 z-20">
        <div>
          <h1 className="text-2xl font-serif tracking-widest text-amber-50/90 drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]">THE VAULT</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
            <p className="text-[10px] text-amber-500/60 font-mono tracking-[0.2em] uppercase">
              SECURE_CONNECTION
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end group cursor-default">
             <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Available Credits</span>
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 group-hover:border-amber-500/30 transition-colors">
               <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
               <span className="text-amber-100 font-mono text-lg leading-none tracking-tight">
                 {points.toLocaleString()}
               </span>
             </div>
           </div>
           
           <button 
             onClick={() => setShowAdmin(!showAdmin)}
             className="p-3 rounded-full bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
           >
             <Settings2 size={18} />
           </button>
        </div>
      </header>

      {/* --- ADMIN DRAWER --- */}
      <AnimatePresence>
        {showAdmin && (
          <motion.div 
            initial={{ height: 0, opacity: 0, scale: 0.95 }}
            animate={{ height: 'auto', opacity: 1, scale: 1 }}
            exit={{ height: 0, opacity: 0, scale: 0.95 }}
            className="px-4 md:px-6 mb-4 z-30 flex justify-center"
          >
            <div className="w-full max-w-2xl">
              <VaultAdminPanel onClose={() => setShowAdmin(false)} onAdd={addShopItem} items={shopItems} onRemove={removeShopItem} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN STAGE --- */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 min-h-[350px] px-4">
        {/* Use popLayout to prevent layout shifts/delays */}
        <AnimatePresence mode="popLayout">
          {reward ? (
            /* --- REWARD CARD --- */
            <motion.div
              key="reward-card"
              initial={{ opacity: 0, scale: 0.5, y: 100, rotateX: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="relative w-full max-w-sm"
            >
               <div className="bg-[#0e0e0e]/80 backdrop-blur-2xl rounded-[2.5rem] p-1 shadow-[0_0_60px_-15px_rgba(245,158,11,0.3)] border border-amber-500/30">
                 <div className="bg-gradient-to-b from-[#1a1a1a] to-[#050505] rounded-[2.3rem] p-8 flex flex-col items-center text-center relative overflow-hidden">
                    
                    {/* Background Shine */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.15),transparent_70%)]" />

                    <motion.div 
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="relative z-10 w-28 h-28 rounded-full bg-[#111] flex items-center justify-center mb-6 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.15)] group"
                    >
                       <div className="absolute inset-0 rounded-full bg-amber-500/5 animate-ping" />
                       <Gift size={48} className="text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                    </motion.div>

                    <h2 className="relative z-10 text-2xl font-bold text-white mb-2 tracking-wide uppercase font-serif">
                      {reward.name}
                    </h2>
                    
                    <div className="flex items-center gap-2 mb-8">
                      <span className="w-1 h-1 bg-amber-500 rounded-full" />
                      <p className="relative z-10 text-[10px] text-amber-500/80 font-mono tracking-widest uppercase">
                        Rarity Level: {reward.desireLevel}
                      </p>
                      <span className="w-1 h-1 bg-amber-500 rounded-full" />
                    </div>

                    <button 
                      onClick={() => setReward(null)}
                      className="relative z-10 w-full py-4 bg-gradient-to-r from-amber-200 to-amber-100 text-amber-950 font-black text-xs tracking-[0.2em] uppercase rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_20px_-5px_rgba(245,158,11,0.4)]"
                    >
                      Collect Asset
                    </button>
                 </div>
               </div>
            </motion.div>
          ) : (
            /* --- THE LOCK --- */
            <motion.div 
              key="lock-mechanism"
              exit={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center relative"
            >
               <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                  {/* Outer Rings */}
                  <div className="absolute inset-0 rounded-full border border-white/5 shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)]" />
                  
                  <motion.div 
                    animate={isUnlocking ? { rotate: 360, scale: [1, 0.9, 1] } : { rotate: 0 }}
                    transition={isUnlocking ? { duration: 2, ease: "easeInOut", repeat: Infinity } : {}}
                    className="absolute inset-6 rounded-full border-[1px] border-dashed border-white/10"
                  />
                  
                  <motion.div 
                    animate={isUnlocking ? { 
                      rotate: -360, 
                      borderColor: ["rgba(255,255,255,0.1)", "rgba(245,158,11,0.6)", "rgba(255,255,255,0.1)"] 
                    } : {}}
                    transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                    className="absolute inset-12 rounded-full border border-white/5"
                  />

                  {/* The Button */}
                  <button
                    onClick={handleUnlock}
                    disabled={points < 100 || isUnlocking}
                    className={clsx(
                      "relative w-36 h-36 md:w-40 md:h-40 rounded-full flex items-center justify-center transition-all duration-500 z-20 group outline-none",
                      isUnlocking ? "scale-90 cursor-wait" : "hover:scale-105 active:scale-95 cursor-pointer"
                    )}
                  >
                     {/* Button Glass & Glow */}
                     <div className={clsx(
                       "absolute inset-0 rounded-full backdrop-blur-xl border transition-all duration-500 shadow-2xl",
                       isUnlocking 
                         ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.2)]" 
                         : "bg-gradient-to-br from-white/10 to-white/5 border-white/10 group-hover:border-amber-500/30 group-hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.15)]"
                     )} />
                     
                     <div className="relative z-30 text-center flex flex-col items-center">
                       {isUnlocking ? (
                         <Unlock size={36} className="text-amber-400 animate-bounce" />
                       ) : (
                         <Lock size={36} className={clsx("transition-colors mb-2", points >= 100 ? "text-gray-200 group-hover:text-white" : "text-gray-600")} />
                       )}
                       
                       {!isUnlocking && (
                         <div className="text-[10px] font-black tracking-widest text-gray-500 uppercase group-hover:text-amber-400 transition-colors">
                           {points >= 100 ? "UNLOCK" : "LOCKED"}
                         </div>
                       )}
                     </div>
                  </button>
               </div>
               
               {/* Cost Indicator */}
               <motion.div 
                 animate={{ opacity: isUnlocking ? 0 : 1, y: isUnlocking ? 20 : 0 }}
                 className="mt-8 flex flex-col items-center gap-2"
               >
                 <div className={clsx("px-4 py-1.5 rounded-full border bg-black/50 backdrop-blur text-[10px] font-mono tracking-widest uppercase transition-colors",
                    points >= 100 ? "border-white/10 text-gray-400" : "border-red-900/50 text-red-500"
                 )}>
                   Cost: 100 Credits
                 </div>
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- INVENTORY (Horizontal Snap Scroll) --- */}
      <div className="h-auto min-h-[240px] bg-[#080808] border-t border-white/5 flex flex-col relative z-20 shadow-[0_-20px_40px_-15px_rgba(0,0,0,1)]">
        <div className="px-6 py-4 flex items-center justify-between relative z-10">
           <div className="flex items-center gap-2">
             <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20">
               <PackageOpen size={12} className="text-amber-500" />
             </div>
             <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Storage_Locker</h3>
           </div>
           <span className="text-[10px] text-gray-600 font-mono">{inventory.length} ITEMS</span>
        </div>
        
        {/* Scrollable Container */}
        <div className="flex-1 relative group">
           {inventory.length === 0 ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
               <div className="w-16 h-16 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center mb-3">
                 <Key size={24} className="text-gray-600" />
               </div>
               <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600">No Assets Secure</p>
             </div>
           ) : (
             <div 
                ref={inventoryRef}
                className="flex items-center gap-4 px-6 pb-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full"
             >
               {/* Reverse inventory to show newest first if desired, or keep as is */}
               {[...inventory].reverse().map((ticket, index) => (
                 <VaultItem 
                   key={ticket.id} 
                   ticket={ticket} 
                   onUse={useInventoryItem} 
                 />
               ))}
               {/* Spacer for right padding */}
               <div className="w-2 shrink-0" />
             </div>
           )}
           
           {/* Fade Edges */}
           <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#080808] to-transparent pointer-events-none" />
           <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#080808] to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: VAULT ITEM (Improved Aesthetic) ---
const VaultItem = ({ ticket, onUse }) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative flex-shrink-0 w-[180px] snap-start"
    >
      <div className="group w-full h-[130px] p-4 bg-[#111] border border-white/5 hover:border-amber-500/30 rounded-[1.5rem] transition-all duration-300 hover:shadow-[0_10px_30px_-10px_rgba(245,158,11,0.15)] flex flex-col justify-between overflow-hidden relative">
        
        {/* Subtle Gradient BG */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10 flex items-start justify-between">
           <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center border border-white/10 text-amber-500/60 group-hover:text-amber-400 group-hover:border-amber-500/30 transition-colors">
              <Key size={14} />
           </div>
           <span className="text-[8px] text-gray-700 font-mono tracking-tighter group-hover:text-gray-500 transition-colors">
             #{ticket.id.slice(-4).toUpperCase()}
           </span>
        </div>

        <div className="relative z-10 mt-2">
          <h4 className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors uppercase tracking-wide truncate">
            {ticket.name}
          </h4>
          <p className="text-[8px] text-gray-600 uppercase tracking-wider mt-0.5">Stored Item</p>
        </div>
        
        <button 
          onClick={() => onUse(ticket.id)}
          className="relative z-10 w-full py-2 mt-auto text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-black border border-white/5 group-hover:bg-amber-500 rounded-lg transition-all"
        >
          Retrieve
        </button>
      </div>
    </motion.div>
  );
};

// --- COMPONENT: ADMIN PANEL (Sleek & Dark) ---
const VaultAdminPanel = ({ onClose, onAdd, items, onRemove }) => {
  const [name, setName] = useState('');
  const [desire, setDesire] = useState(5);
  
  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name, desireLevel: desire });
    setName('');
    setDesire(5);
  };

  return (
    <div className="bg-[#0e0e0e] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-50" />
      
      <div className="flex justify-between items-center mb-6">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">System_Config</span>
         </div>
         <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
           <X size={16} className="text-gray-500 hover:text-white" />
         </button>
      </div>
      
      <div className="flex flex-col gap-4 mb-6">
        {/* Input Group */}
        <div className="flex flex-col md:flex-row gap-3">
          <input 
            value={name} onChange={e => setName(e.target.value)}
            placeholder="ENTER ASSET DESIGNATION..."
            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white font-mono uppercase outline-none focus:border-amber-500/50 placeholder-gray-700 transition-colors"
          />
          <button 
            onClick={handleAdd} 
            className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-amber-500 hover:text-black hover:border-amber-500 text-gray-400 rounded-xl transition-all flex items-center justify-center gap-2 group"
          >
             <Plus size={14} /> <span className="text-[9px] font-bold uppercase tracking-widest">Add</span>
          </button>
        </div>

        {/* Range Slider */}
        <div className="flex items-center gap-4 bg-white/[0.02] p-3 rounded-xl border border-white/[0.05]">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider w-16">Rarity {desire}</span>
          <input 
            type="range" 
            min="1" max="10" 
            value={desire} 
            onChange={(e) => setDesire(Number(e.target.value))}
            className="flex-1 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>

      {/* Item List */}
      <div className="max-h-[150px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
         {items.map(i => (
           <div key={i.id} className="flex justify-between items-center group hover:bg-white/[0.03] p-3 rounded-xl border border-white/[0.02] transition-colors">
             <div className="flex items-center gap-3">
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${i.desireLevel > 7 ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-500'}`}>
                  Lvl.{i.desireLevel}
                </span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wide truncate">{i.name}</span>
             </div>
             <button onClick={() => onRemove(i.id)} className="text-gray-700 hover:text-red-500 transition-colors p-1">
               <Trash2 size={12} />
             </button>
           </div>
         ))}
      </div>
    </div>
  );
};