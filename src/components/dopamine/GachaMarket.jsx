import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Lock, Unlock, Gift, Settings2, X, Plus, Trash2, Key, Package, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import useMarketStore from '../../store/marketStore';

export const GachaMarket = () => {
  const { points, shopItems, buyLotteryTicket, inventory, useInventoryItem, addShopItem, removeShopItem } = useMarketStore();
  
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [reward, setReward] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isStorageOpen, setIsStorageOpen] = useState(false); // Controls the storage box visibility
  const [hasNewItem, setHasNewItem] = useState(false); // Notification dot state

  // --- THE UNLOCKING RITUAL ---
  const handleUnlock = async () => {
    if (points < 100 || isUnlocking) return;

    setIsUnlocking(true);
    setReward(null);

    const result = buyLotteryTicket(100);
    
    if (!result.success) {
      setIsUnlocking(false);
      return; 
    }

    if (navigator.vibrate) navigator.vibrate([30, 50, 30]); 

    setTimeout(() => {
      setReward(result.item);
      setIsUnlocking(false);
      
      const isRare = result.item.desireLevel > 7;
      triggerConfetti(isRare);
      if (navigator.vibrate) navigator.vibrate(isRare ? 300 : 100);
    }, 2000); 
  };

  const handleCollect = () => {
    setReward(null);
    setHasNewItem(true); // Show red dot on storage button
  };

  const triggerConfetti = (isRare) => {
    const colors = isRare 
      ? ['#FFD700', '#F59E0B', '#FFFFFF'] 
      : ['#94A3B8', '#E2E8F0', '#FFFFFF']; 
    confetti({ particleCount: isRare ? 150 : 80, spread: 100, origin: { y: 0.5 }, colors, zIndex: 100 });
  };

  return (
    // MAIN CONTAINER: Rounded corners as requested
    <div className="flex flex-col h-full w-full bg-[#050505] text-white overflow-hidden relative font-sans selection:bg-amber-500/30 rounded-[2.5rem] border border-white/5 shadow-2xl">
      
      {/* --- AMBIENT LIGHTING --- */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-[600px] aspect-square bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* --- HEADER --- */}
      <header className="px-6 py-5 flex justify-between items-start shrink-0 z-20">
        <div>
          <h1 className="text-xl font-serif tracking-widest text-amber-50/90 drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]">THE VAULT</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
            <p className="text-[9px] text-amber-500/60 font-mono tracking-[0.2em] uppercase">
              SECURE_CONN
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex flex-col items-end group cursor-default">
             <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Credits</span>
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 group-hover:border-amber-500/30 transition-colors">
               <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
               <span className="text-amber-100 font-mono text-base leading-none tracking-tight">
                 {points.toLocaleString()}
               </span>
             </div>
           </div>
           
           <button 
             onClick={() => setShowAdmin(!showAdmin)}
             className="p-2.5 rounded-full bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
           >
             <Settings2 size={16} />
           </button>
        </div>
      </header>

      {/* --- ADMIN DRAWER --- */}
      <AnimatePresence>
        {showAdmin && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 mb-2 z-30 flex justify-center w-full"
          >
            <div className="w-full max-w-lg">
              <VaultAdminPanel onClose={() => setShowAdmin(false)} onAdd={addShopItem} items={shopItems} onRemove={removeShopItem} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN STAGE (LOCK & REWARD) --- */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 pb-20">
        <AnimatePresence mode="popLayout">
          {reward ? (
            /* --- REWARD CARD --- */
            <motion.div
              key="reward-card"
              initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="relative w-full max-w-[320px]"
            >
               <div className="bg-[#0e0e0e]/90 backdrop-blur-2xl rounded-[2.5rem] p-1 shadow-[0_0_60px_-15px_rgba(245,158,11,0.25)] border border-amber-500/30">
                 <div className="bg-gradient-to-b from-[#1a1a1a] to-[#050505] rounded-[2.3rem] p-6 flex flex-col items-center text-center relative overflow-hidden">
                    
                    {/* Background Shine */}
                    <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.1),transparent_70%)]" />

                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="relative z-10 w-24 h-24 rounded-full bg-[#111] flex items-center justify-center mb-5 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.15)] group"
                    >
                       <div className="absolute inset-0 rounded-full bg-amber-500/5 animate-ping" />
                       <Gift size={40} className="text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                    </motion.div>

                    <h2 className="relative z-10 text-xl font-bold text-white mb-2 tracking-wide uppercase font-serif">
                      {reward.name}
                    </h2>
                    
                    <div className="flex items-center gap-2 mb-6">
                      <span className="w-1 h-1 bg-amber-500 rounded-full" />
                      <p className="relative z-10 text-[9px] text-amber-500/80 font-mono tracking-widest uppercase">
                        Rarity Level: {reward.desireLevel}
                      </p>
                      <span className="w-1 h-1 bg-amber-500 rounded-full" />
                    </div>

                    <button 
                      onClick={handleCollect}
                      className="relative z-10 w-full py-3.5 bg-gradient-to-r from-amber-200 to-amber-100 text-amber-950 font-black text-[10px] tracking-[0.2em] uppercase rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
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
               <div className="relative w-64 h-64 md:w-72 md:h-72 flex items-center justify-center">
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

                  <button
                    onClick={handleUnlock}
                    disabled={points < 100 || isUnlocking}
                    className={clsx(
                      "relative w-32 h-32 md:w-36 md:h-36 rounded-full flex items-center justify-center transition-all duration-500 z-20 group outline-none",
                      isUnlocking ? "scale-90" : "active:scale-95"
                    )}
                  >
                     <div className={clsx(
                       "absolute inset-0 rounded-full backdrop-blur-xl border transition-all duration-500 shadow-2xl",
                       isUnlocking 
                         ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_60px_rgba(245,158,11,0.2)]" 
                         : "bg-gradient-to-br from-white/10 to-white/5 border-white/10"
                     )} />
                     
                     <div className="relative z-30 text-center flex flex-col items-center">
                       {isUnlocking ? (
                         <Unlock size={32} className="text-amber-400 animate-bounce mb-1" />
                       ) : (
                         <Lock size={32} className={clsx("transition-colors mb-1", points >= 100 ? "text-gray-200" : "text-gray-600")} />
                       )}
                       
                       {!isUnlocking && (
                         <div className="text-[9px] font-black tracking-widest text-gray-500 uppercase">
                           {points >= 100 ? "OPEN" : "LOCKED"}
                         </div>
                       )}
                     </div>
                  </button>
               </div>
               
               <motion.div 
                 animate={{ opacity: isUnlocking ? 0 : 1, y: isUnlocking ? 20 : 0 }}
                 className="mt-6 flex flex-col items-center gap-2"
               >
                 <div className={clsx("px-4 py-1.5 rounded-full border bg-black/50 backdrop-blur text-[9px] font-mono tracking-widest uppercase transition-colors",
                    points >= 100 ? "border-white/10 text-gray-400" : "border-red-900/50 text-red-500"
                 )}>
                   Cost: 100 Credits
                 </div>
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- STORAGE BUTTON (Floating at Bottom) --- */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20">
         <motion.button 
           whileTap={{ scale: 0.95 }}
           onClick={() => {
             setIsStorageOpen(true);
             setHasNewItem(false);
           }}
           className={clsx(
             "relative flex items-center gap-3 pl-5 pr-6 py-3.5 rounded-full border backdrop-blur-xl transition-all shadow-xl group",
             hasNewItem 
               ? "bg-[#1A1A1A] border-amber-500/50 text-amber-100 shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]" 
               : "bg-[#111]/90 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
           )}
         >
           <div className="relative">
             <Package size={18} className={hasNewItem ? "text-amber-400" : ""} />
             {hasNewItem && (
               <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#111] animate-pulse" />
             )}
           </div>
           <div className="flex flex-col items-start leading-none">
             <span className="text-[10px] font-bold uppercase tracking-widest">Open Storage</span>
             <span className="text-[8px] font-mono opacity-50 mt-0.5">{inventory.length} ITEMS</span>
           </div>
         </motion.button>
      </div>

      {/* --- STORAGE DRAWER (SLIDE UP) --- */}
      <AnimatePresence>
        {isStorageOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStorageOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 rounded-[2.5rem]"
            />
            
            {/* Drawer Content */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 h-[65%] bg-[#0e0e0e] border-t border-white/10 rounded-t-[2.5rem] z-40 flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
            >
               {/* Header */}
               <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 shrink-0" onClick={() => setIsStorageOpen(false)}>
                  <div className="flex items-center gap-3">
                     <div className="p-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                        <Package size={16} className="text-amber-500" />
                     </div>
                     <h3 className="text-sm font-bold text-white uppercase tracking-widest">My Assets</h3>
                  </div>
                  <button 
                    onClick={() => setIsStorageOpen(false)}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <ChevronDown size={20} className="text-gray-400" />
                  </button>
               </div>

               {/* Inventory List */}
               <div className="flex-1 overflow-y-auto p-6 pb-10 scrollbar-hide">
                  {inventory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                       <Key size={40} className="mb-4" />
                       <p className="text-xs font-mono uppercase tracking-widest">Storage Empty</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                       {[...inventory].reverse().map((ticket) => (
                         <div key={ticket.id} className="group relative bg-[#151515] border border-white/5 p-4 rounded-2xl flex flex-col gap-3 hover:border-amber-500/30 transition-all">
                            <div className="flex justify-between items-start">
                               <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center text-amber-500/50 group-hover:text-amber-400">
                                  <Key size={14} />
                               </div>
                               <span className="text-[9px] font-mono text-gray-700">#{ticket.id.slice(-4)}</span>
                            </div>
                            <div>
                               <h4 className="text-[11px] font-bold text-gray-300 uppercase tracking-wide group-hover:text-white truncate">{ticket.name}</h4>
                               <p className="text-[9px] text-gray-600 uppercase mt-0.5">Stored</p>
                            </div>
                            <button 
                               onClick={() => useInventoryItem(ticket.id)}
                               className="w-full py-2.5 mt-2 bg-white/5 hover:bg-amber-500 text-gray-400 hover:text-black text-[9px] font-bold uppercase tracking-widest rounded-xl transition-colors"
                            >
                               Retrieve
                            </button>
                         </div>
                       ))}
                    </div>
                  )}
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- COMPONENT: ADMIN PANEL (Compact Mobile) ---
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
    <div className="bg-[#0e0e0e] border border-white/10 rounded-[2rem] p-5 shadow-2xl relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
         <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest pl-1">Config</span>
         <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 transition-colors">
           <X size={14} className="text-gray-500 hover:text-white" />
         </button>
      </div>
      
      <div className="flex flex-col gap-3 mb-4">
        {/* Compact Input Row */}
        <div className="flex gap-2">
          <input 
            value={name} onChange={e => setName(e.target.value)}
            placeholder="ITEM NAME..."
            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-white font-mono uppercase outline-none focus:border-amber-500/50"
          />
          <button 
            onClick={handleAdd} 
            className="px-4 bg-white/5 border border-white/10 hover:bg-amber-500 hover:text-black text-gray-400 rounded-xl transition-all flex items-center justify-center"
          >
             <Plus size={14} /> 
          </button>
        </div>

        {/* Compact Slider */}
        <div className="flex items-center gap-3 bg-white/[0.02] p-2 rounded-xl border border-white/[0.05]">
          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-wider w-10">Rarity</span>
          <input 
            type="range" 
            min="1" max="10" 
            value={desire} 
            onChange={(e) => setDesire(Number(e.target.value))}
            className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <span className="text-[9px] font-mono font-bold text-amber-500 w-3 text-center">{desire}</span>
        </div>
      </div>

      {/* Compact List */}
      <div className="max-h-[120px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
         {items.map(i => (
           <div key={i.id} className="flex justify-between items-center bg-white/[0.02] p-2 rounded-xl border border-white/[0.02]">
             <div className="flex items-center gap-2">
                <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${i.desireLevel > 7 ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-500'}`}>
                  Lvl.{i.desireLevel}
                </span>
                <span className="text-[9px] text-gray-400 uppercase tracking-wide truncate max-w-[120px]">{i.name}</span>
             </div>
             <button onClick={() => onRemove(i.id)} className="text-gray-700 hover:text-red-500 p-1">
               <Trash2 size={12} />
             </button>
           </div>
         ))}
      </div>
    </div>
  );
};