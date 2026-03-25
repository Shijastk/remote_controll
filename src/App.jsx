import React, { useState, useEffect } from 'react';
import { MousePointer2, Music, Keyboard as KeyboardIcon, Monitor, Settings, Zap, Shield, Wifi, ArrowRight, Laptop, HelpCircle, Tv, Smartphone, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, CornerDownLeft, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { socket, connectToLocalIp, joinCloudRoom, emit } from './lib/socket';
import Trackpad from './components/Trackpad';
import MediaControls from './components/MediaControls';
import Keyboard from './components/Keyboard';
import ScreenViewer from './components/ScreenViewer';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const TABS = [
  { id: 'mouse', icon: MousePointer2, label: 'Mouse' },
  { id: 'media', icon: Music, label: 'Media' },
  { id: 'keyboard', icon: KeyboardIcon, label: 'Keys' },
  { id: 'screen', icon: Monitor, label: 'Screen' },
];

function ConnectionScreen({ onConnectPC, onEnterTVMode, onJoinTVCode }) {
  const [ip, setIp] = useState(localStorage.getItem('pc-remote-last-ip') || '');
  const [tvCode, setTvCode] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (e) => setError(e.detail);
    window.addEventListener('socket:error', handleError);
    return () => window.removeEventListener('socket:error', handleError);
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-8 text-center space-y-8 bg-neutral-950 overflow-y-auto pt-12 pb-24">
      <div className="space-y-4">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto relative pointer-events-none">
          <Shield className="text-emerald-500" size={32} />
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-emerald-500/20 rounded-3xl -z-10"
          />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Privacy Remote SaaS</h2>
      </div>

      <div className="w-full max-w-[340px] space-y-6">
        {/* PC Section */}
        <div className="space-y-4 bg-white/[0.02] border border-white/5 p-6 rounded-3xl text-left">
            <div className="flex items-center gap-3">
                <Laptop size={18} className="text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-40">Option 1: Control a PC</span>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4 focus-within:border-emerald-500/30 transition-all">
                <Wifi className="text-zinc-500" size={20} />
                <input 
                    type="text"
                    placeholder="PC IP (e.g. 192.168.1.10)"
                    value={ip}
                    onChange={(e) => { setIp(e.target.value); setError(null); }}
                    className="bg-transparent border-none outline-none flex-1 text-sm font-mono"
                />
            </div>
            {error && <p className="text-[10px] text-rose-500 font-medium">Connection failed. Visit PC URL once to allow.</p>}
            <button 
                onClick={() => onConnectPC(ip)}
                disabled={!ip}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-20"
            >
                Connect PC <ArrowRight size={18} />
            </button>
        </div>

        {/* TV Section */}
        <div className="space-y-4 bg-blue-500/5 border border-blue-500/10 p-6 rounded-3xl text-left">
            <div className="flex items-center gap-3">
                <Tv size={18} className="text-blue-500" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-40 text-blue-400">Option 2: Control a TV</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={onEnterTVMode}
                    className="flex flex-col items-center justify-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl hover:bg-blue-500/20 transition-all active:scale-95"
                >
                    <Tv size={24} className="mb-2" />
                    <span className="text-[10px] font-bold uppercase leading-tight">I am On a TV</span>
                </button>
                <div className="flex flex-col gap-2">
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-3 flex items-center gap-2">
                        <input 
                            type="number"
                            placeholder="Code"
                            value={tvCode}
                            onChange={(e) => setTvCode(e.target.value)}
                            className="bg-transparent border-none outline-none w-full text-center font-mono font-bold text-lg placeholder:opacity-20"
                        />
                    </div>
                    <button 
                        onClick={() => onJoinTVCode(tvCode)}
                        disabled={tvCode.length !== 6}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-[10px] uppercase tracking-wider active:scale-95 transition-all disabled:opacity-20"
                    >
                        Join TV
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function TVController() {
    const sendKey = (key) => emit('key:press', key);
    
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 select-none">
            <div className="grid grid-cols-3 gap-4 mb-12">
                <div />
                <button onClick={() => sendKey('up')} className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center active:bg-blue-500 transform transition-all"><ChevronUp size={32}/></button>
                <div />
                <button onClick={() => sendKey('left')} className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center active:bg-blue-500 transform transition-all"><ChevronLeft size={32}/></button>
                <button onClick={() => sendKey('enter')} className="w-16 h-16 rounded-3xl bg-blue-600 text-white font-black active:scale-90 transform transition-all shadow-xl shadow-blue-500/40">OK</button>
                <button onClick={() => sendKey('right')} className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center active:bg-blue-500 transform transition-all"><ChevronRight size={32}/></button>
                <div />
                <button onClick={() => sendKey('down')} className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center active:bg-blue-500 transform transition-all"><ChevronDown size={32}/></button>
                <div />
            </div>

            <div className="flex gap-8">
                <button onClick={() => sendKey('backspace')} className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center active:scale-95"><CornerDownLeft size={24} className="opacity-50" /></button>
                <button onClick={() => sendKey('escape')} className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center active:scale-95"><RotateCcw size={21} className="opacity-50" /></button>
            </div>
            
            <div className="mt-16 text-[10px] uppercase tracking-widest font-bold opacity-20">Smart TV Remote Mode</div>
        </div>
    );
}

function TVReceiver({ code, onExit }) {
    const [lastAction, setLastAction] = useState('Waiting for Phone...');

    useEffect(() => {
        const onCommand = (e) => {
            const { event, data } = e.detail;
            setLastAction(`Command: ${data}`);
            // In a real TV app, you would handle scrolling or clicking the browser UI here
            console.log("TV Commmand Received:", event, data);
        };
        window.addEventListener('relay:command', onCommand);
        return () => window.removeEventListener('relay:command', onCommand);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full bg-black text-center p-12">
            <h2 className="text-6xl font-black mb-4 tracking-tighter">TV RECEIVER</h2>
            <div className="bg-white/5 p-16 rounded-[4rem] border border-white/5 shadow-2xl mb-12">
                <div className="text-sm font-bold uppercase tracking-[0.5em] opacity-40 mb-4">Pair with Phone</div>
                <div className="text-8xl font-black font-mono text-emerald-500 tracking-widest">{code}</div>
            </div>
            <div className="px-6 py-3 bg-white/5 rounded-2xl text-zinc-500 text-lg border border-white/5 animate-pulse italic">
                {lastAction}
            </div>
            <button onClick={onExit} className="mt-24 opacity-30 hover:opacity-100 transition-opacity">Exit</button>
        </div>
    );
}

export default function App() {
  const [appMode, setAppMode] = useState('home'); // home, pc, tv-receiver, tv-controller
  const [tvCode, setTvCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    window.addEventListener('socket:connected', onConnect);
    return () => window.removeEventListener('socket:connected', onConnect);
  }, []);

  const handleConnectPC = (ip) => connectToLocalIp(ip);
  
  const handleEnterTVMode = () => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setTvCode(code);
      setAppMode('tv-receiver');
      joinCloudRoom(code, true);
  };

  const handleJoinTVCode = (code) => {
      setTvCode(code);
      setAppMode('tv-controller');
      joinCloudRoom(code, false);
  };

  if (appMode === 'home') return <ConnectionScreen onConnectPC={handleConnectPC} onEnterTVMode={handleEnterTVMode} onJoinTVCode={handleJoinTVCode} />;
  if (appMode === 'tv-receiver') return <TVReceiver code={tvCode} onExit={() => setAppMode('home')} />;
  if (appMode === 'tv-controller') return <div className="h-full bg-neutral-950 flex flex-col pt-12"><TVController /></div>;

  return (
    <div className="flex flex-col h-full bg-neutral-950">
      <header className="px-6 py-4 flex items-center justify-between glass z-50">
        <h1 className="text-sm font-bold uppercase opacity-60">PC Remote</h1>
        <button onClick={() => setAppMode('home')} className="bg-white/5 p-2 rounded-xl"><Settings size={16}/></button>
      </header>

      <main className="flex-1 min-h-0 relative">
        <Trackpad />
      </main>

      <nav className="glass py-2 px-4 flex justify-around items-center border-t border-white/5">
        <button className="text-white p-3"><MousePointer2 size={24}/></button>
        <button className="text-white/40 p-3"><KeyboardIcon size={24}/></button>
      </nav>
    </div>
  );
}
