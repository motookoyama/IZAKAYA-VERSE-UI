import { useState, useEffect } from 'react';
import { Download, Tag, Database, ExternalLink, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

interface DockCard {
    id: string;
    name: string;
    type: 'character' | 'world' | 'plot';
    description: string;
    image: string;
    fileName: string;
    tags: string[];
}

export default function CardDock() {
    const [activeTab, setActiveTab] = useState<'all' | 'character' | 'world' | 'plot'>('all');
    const [cards, setCards] = useState<DockCard[]>([]);
    const [loading, setLoading] = useState(true);

    // MetaCapture State
    const [mcPrompt, setMcPrompt] = useState('');
    const [mcMode, setMcMode] = useState('CharacterCard');
    const [isLaunching, setIsLaunching] = useState(false);

    useEffect(() => {
        // Load card catalog from JSON
        fetch('/cards/catalog.json')
            .then(res => res.json())
            .then(data => {
                setCards(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load card catalog:', err);
                setLoading(false);
            });
    }, []);

    const filteredCards = activeTab === 'all'
        ? cards
        : cards.filter(card => card.type === activeTab);

    const handleDownload = (card: DockCard) => {
        const link = document.createElement('a');
        // Ensure the path is correct relative to the public directory
        // If image path in JSON is absolute (starts with /verse/), use it directly
        // Otherwise assume it's in official folder
        const downloadUrl = card.image.startsWith('/') ? card.image : `/cards/official/${card.fileName}`;

        link.href = downloadUrl;
        link.download = card.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenSatellite = async () => {
        const COST = 50;
        const DAILY_LIMIT = 5;
        const uid = 'verse-user'; // TODO: Use actual UID
        const today = new Date().toISOString().split('T')[0];
        const storageKey = `metacapture_daily_count_${today}_${uid}`;

        // Check daily limit
        const currentCount = parseInt(localStorage.getItem(storageKey) || '0', 10);
        if (currentCount >= DAILY_LIMIT) {
            alert(`1日の生成上限（${DAILY_LIMIT}回）に達しました。明日またお試しください。`);
            return;
        }

        if (!mcPrompt.trim()) {
            alert('生成したいキャラクターや世界観のイメージ（プロンプト）を入力してください。');
            return;
        }

        // Confirm with user
        if (!confirm(`MetaCapture 2.0 (衛星アプリ) を起動しますか？\n\n消費ポイント: ${COST}pt\n本日の残り回数: ${DAILY_LIMIT - currentCount}回\n\nモード: ${mcMode}\nプロンプト: ${mcPrompt}`)) {
            return;
        }

        setIsLaunching(true);

        try {
            // Call Protocol Relay Endpoint
            const response = await api.getMetaCaptureLink(uid, mcPrompt, mcMode, true);

            if (response.ok && response.url) {
                // Update local count
                localStorage.setItem(storageKey, (currentCount + 1).toString());

                // Open Satellite App with Protocol Relay URL
                window.open(response.url, '_blank');
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error: any) {
            console.error('Failed to launch MetaCapture:', error);
            if (error.message.includes('insufficient_balance')) {
                alert('ポイントが不足しています。');
            } else {
                alert('エラーが発生しました。もう一度お試しください。');
            }
        } finally {
            setIsLaunching(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-6 pb-24">
            <header className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3 text-emerald-400">
                    <Database className="w-8 h-8" />
                    Card Dock
                </h1>
                <p className="text-slate-400 mt-2">
                    公式配布カード倉庫。ここからPNGをダウンロードして、Verseにインポートできます。
                </p>

                <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-emerald-400 flex items-center gap-2">
                            <ExternalLink size={18} />
                            MetaCapture 2.0 (Satellite App)
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                            衛星軌道上のAI生成モジュールにアクセスし、新しいV2カードを生成します。
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Tag size={12} /> Cost: 50pt / 回</span>
                            <span className="flex items-center gap-1"><AlertTriangle size={12} /> Limit: 5回 / 日</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 w-full md:w-auto">
                        <div className="flex gap-2">
                            <select
                                value={mcMode}
                                onChange={(e) => setMcMode(e.target.value)}
                                className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none"
                            >
                                <option value="CharacterCard">Character</option>
                                <option value="WorldCard">World</option>
                                <option value="StoryPlot">Story Plot</option>
                            </select>
                            <input
                                type="text"
                                value={mcPrompt}
                                onChange={(e) => setMcPrompt(e.target.value)}
                                placeholder="例: 銀髪の騎士、未来都市..."
                                className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm w-full md:w-64 focus:border-emerald-500 outline-none"
                            />
                        </div>
                        <button
                            onClick={handleOpenSatellite}
                            disabled={isLaunching || !mcPrompt.trim()}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-900/20 whitespace-nowrap flex items-center justify-center gap-2"
                        >
                            {isLaunching ? (
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                            ) : (
                                <ExternalLink size={18} />
                            )}
                            衛星アプリを起動
                        </button>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {(['all', 'character', 'world', 'plot'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">Loading catalog...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCards.map((card) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-emerald-500/50 transition-colors group"
                        >
                            <div className="aspect-[3/2] bg-slate-900 relative overflow-hidden">
                                {/* Image Placeholder or Real Image */}
                                <img
                                    src={card.image}
                                    alt={card.name}
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    onError={(e) => {
                                        // Fallback if image not found
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/1e293b/475569?text=No+Image';
                                    }}
                                />
                                <div className="absolute top-2 right-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${card.type === 'character' ? 'bg-blue-500/80 text-blue-50' :
                                        card.type === 'world' ? 'bg-purple-500/80 text-purple-50' :
                                            'bg-amber-500/80 text-amber-50'
                                        }`}>
                                        {card.type}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="font-bold text-lg mb-1">{card.name}</h3>
                                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{card.description}</p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {card.tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1 text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded">
                                            <Tag className="w-3 h-3" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleDownload(card)}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-emerald-600 text-white py-2 rounded-lg transition-colors font-medium"
                                >
                                    <Download className="w-4 h-4" />
                                    Download PNG
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
