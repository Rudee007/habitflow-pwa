import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ShoppingBag, Lock, Gift, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx'; // <--- FIXED: Added this missing import
import useMarketStore from '../../store/marketStore';

const REEL_HEIGHT = 120; // Height of one item in pixels

export const GachaMarket = () => {
  const { points, shopItems, buyLotteryTicket, inventory, useInventoryItem } = useMarketStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const [winResult, setWinResult] = useState(null);
  const controls = useAnimation();

  // PSYCHOLOGY: We create a "Fake" reel that repeats items to simulate speed
  // We place high-value items visibly in the reel but make them fast to create "Near Miss"
  const reelItems = [...shopItems, ...shopItems, ...shopItems, ...shopItems]; 

  const handleRoll = async () => {
    if (points < 100 || isSpinning) return;

    setIsSpinning(true);
    setWinResult(null);

    // 1. Determine Winner (Backend Logic)
    const result = buyLotteryTicket(100); 
    
    if (!result.success) {
      setIsSpinning(false);
      return; 
    }

    const winner = result.item;
    
    // 2. The Spin Animation
    // We scroll way down the list, and land on the specific index of the winner
    // We purposely pick a 'winner' index deep in the array
    const winningIndex = reelItems.lastIndexOf(reelItems.find(i => i.id === winner.id));
    const targetY = -(winningIndex * REEL_HEIGHT);

    // Play a "click" sound if you have one, or vibrate
    if (navigator.vibrate) navigator.vibrate(50);

    await controls.start({
      y: [0, targetY],
      transition: { 
        duration: 3, 
        ease: [0.1, 0.9, 0.2, 1.0] // Bezier for "Spin up" and "Slow down" friction
      }
    });

    // 3. The Payoff
    setWinResult(winner);
    setIsSpinning(false);
    
    if (winner.desireLevel > 7) {
      // Big win confetti
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } else {
      // Small win confetti
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
      if (navigator.vibrate) navigator.vibrate(100);
    }
    
    // Reset reel visually (instant jump)
    controls.set({ y: 0 });
  };

  return (
    <div className="flex flex-col h-full bg-black px-4 pt-6 pb-24 overflow-hidden relative">
      
      {/* BALANCE HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white text-xl font-bold flex items-center gap-2">
          <ShoppingBag className="text-accent-purple" />
          The Store
        </h2>
        <div className="bg-gray-800 px-4 py-2 rounded-full border border-gray-700 shadow-glow-purple">
           <span className="text-accent-green font-mono font-bold text-lg">{points} PTS</span>
        </div>
      </div>

      {/* THE GACHA MACHINE */}
      <div className="relative bg-gray-900 border-4 border-gray-700 rounded-3xl h-[200px] mb-8 overflow-hidden shadow-2xl">
        {/* Selection Line (The Winner Zone) */}
        <div className="absolute top-1/2 left-0 right-0 h-[4px] bg-accent-red z-20 -translate-y-1/2 opacity-50 box-shadow-[0_0_10px_#FA114F]"></div>
        
        {/* Gradients for depth */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-gray-900 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900 to-transparent z-10 pointer-events-none"></div>

        {/* The Reel */}
        <div className="h-full flex items-center justify-center">
            {winResult && !isSpinning ? (
               <motion.div 
                 initial={{ scale: 0.5, opacity: 0 }}
                 animate={{ scale: 1.2, opacity: 1 }}
                 className="text-center"
               >
                  <Gift size={60} className="mx-auto text-accent-green mb-2 drop-shadow-lg" />
                  <h3 className="text-white font-bold text-xl">{winResult.name}</h3>
                  <p className="text-gray-400 text-xs mt-1">Ticket added to inventory</p>
               </motion.div>
            ) : (
              <motion.div animate={controls} className="w-full">
                {reelItems.map((item, index) => (
                  <div key={`${item.id}-${index}`} style={{ height: REEL_HEIGHT }} className="flex items-center justify-center border-b border-gray-800/30">
                    <div className={clsx(
                      "flex items-center gap-4 text-2xl font-bold opacity-60",
                      item.desireLevel > 8 ? "text-accent-purple" : "text-gray-500"
                    )}>
                      {item.desireLevel > 8 ? "💎" : "📦"} {item.name}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
        </div>
      </div>

      {/* ACTION BUTTON */}
      <button 
        onClick={handleRoll}
        disabled={points < 100 || isSpinning}
        className={clsx(
          "w-full py-4 rounded-2xl font-black text-xl tracking-widest uppercase transition-all mb-8 shadow-lg",
          points >= 100 && !isSpinning
            ? "bg-accent-purple text-white shadow-glow-purple active:scale-95 hover:bg-accent-purple-light" 
            : "bg-gray-800 text-gray-600 cursor-not-allowed"
        )}
      >
        {isSpinning ? "ROLLING..." : "DRAW TICKET (100 PTS)"}
      </button>

      {/* INVENTORY */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-gray-500 text-xs font-bold mb-4 uppercase tracking-widest pl-1">My Tickets</h3>
        <div className="grid grid-cols-2 gap-3 pb-4">
          {inventory.map((ticket) => (
            <motion.div 
              key={ticket.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 p-4 rounded-2xl border border-gray-700 relative group overflow-hidden hover:border-accent-cyan transition-colors"
            >
               <div className="absolute top-2 right-2 text-[10px] text-gray-500">{new Date(ticket.wonAt).toLocaleDateString()}</div>
               <Gift className="text-accent-cyan mb-2" size={20} />
               <div className="text-white font-bold leading-tight mb-3 text-sm">{ticket.name}</div>
               <button 
                 onClick={() => useInventoryItem(ticket.id)}
                 className="w-full bg-gray-700 hover:bg-accent-green text-gray-300 hover:text-black text-xs py-2 rounded-lg font-bold transition-all"
               >
                 USE TICKET
               </button>
            </motion.div>
          ))}
          {inventory.length === 0 && (
             <div className="col-span-2 text-center text-gray-600 py-8 border border-dashed border-gray-700 rounded-2xl">
                <p className="text-sm">Your inventory is empty.</p>
                <p className="text-xs mt-1 text-gray-700">Complete missions to earn points!</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};