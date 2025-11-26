import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, FileText, Image, Database } from 'lucide-react';

interface HelpDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const HelpDrawer: React.FC<HelpDrawerProps> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-gray-900 border-l border-gray-700 shadow-2xl z-50 overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <HelpCircle className="text-blue-400" />
                                    IZAKAYA ガイド
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-white"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-8">
                                {/* Section 1: V2 Cards */}
                                <section>
                                    <h3 className="text-lg font-semibold text-blue-300 mb-4 flex items-center gap-2">
                                        <FileText size={20} />
                                        V2カードについて
                                    </h3>
                                    <div className="bg-gray-800 rounded-lg p-4 text-gray-300 text-sm leading-relaxed space-y-3">
                                        <p>
                                            IZAKAYA Verseでは、キャラクターやワールドの設定を<b>「V2カード」</b>という形式で扱います。
                                            これはSillyTavernなどの一般的なAIチャットツールと互換性があります。
                                        </p>
                                        <ul className="list-disc list-inside space-y-1 text-gray-400 ml-2">
                                            <li><b>Character Card:</b> AIの人格、口調、記憶を設定します。</li>
                                            <li><b>World Card:</b> 世界観や用語集を定義します。</li>
                                            <li><b>Story Plot:</b> 物語の構成（起承転結）を指示します。</li>
                                        </ul>
                                    </div>
                                </section>

                                {/* Section 2: MetaCapture 2.0 */}
                                <section>
                                    <h3 className="text-lg font-semibold text-pink-300 mb-4 flex items-center gap-2">
                                        <Image size={20} />
                                        MetaCapture 2.0
                                    </h3>
                                    <div className="bg-gray-800 rounded-lg p-4 text-gray-300 text-sm leading-relaxed space-y-3">
                                        <p>
                                            MetaCapture 2.0は、<b>「画像の中にデータを埋め込む」</b>技術です。
                                            一見ただのPNG画像に見えますが、その中にはAIのための膨大なプロンプトデータが隠されています。
                                        </p>
                                        <div className="flex items-center gap-3 bg-gray-900 p-3 rounded border border-gray-700">
                                            <Database size={24} className="text-green-400" />
                                            <div>
                                                <div className="font-bold text-white text-xs">PNG Metadata</div>
                                                <div className="text-xs text-gray-500">tEXt / iTXt Chunks</div>
                                            </div>
                                        </div>
                                        <p>
                                            カード選択画面の「インポート」ボタンから、お持ちのPNGカードを読み込むことができます。
                                            Story Plotカードも同様にPNGとして読み込めます。
                                        </p>
                                    </div>
                                </section>

                                {/* Section 3: Gauges */}
                                <section>
                                    <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                            <div className="w-1 h-4 bg-pink-500 rounded-full"></div>
                                        </div>
                                        2大ゲージシステム
                                    </h3>
                                    <div className="bg-gray-800 rounded-lg p-4 text-gray-300 text-sm leading-relaxed space-y-3">
                                        <div>
                                            <b className="text-blue-300">SYNC RATE (シンクロ率)</b>
                                            <p className="text-xs mt-1">
                                                AIがあなたの意図や世界観をどれだけ深く理解しているかを示します。
                                                会話が噛み合うほど、また応答がスムーズなほど上昇します。
                                            </p>
                                        </div>
                                        <div className="border-t border-gray-700 pt-3">
                                            <b className="text-pink-300">TENSION (テンション)</b>
                                            <p className="text-xs mt-1">
                                                あなたの「今の気分」をAIに伝えます。
                                                <br />
                                                <span className="text-gray-500">0 (Low):</span> 真面目、冷静、硬い応答
                                                <br />
                                                <span className="text-gray-500">100 (High):</span> 混沌、創造的、ハイテンション
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default HelpDrawer;
