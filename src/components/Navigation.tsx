import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Gamepad2, Library, Ticket, Gift, Wallet, HelpCircle } from 'lucide-react';
import { api } from '../lib/api';
import HelpDrawer from './HelpDrawer';

const Navigation = () => {
  const location = useLocation();
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        // TODO: Use actual UID
        const data = await api.getWalletBalance("verse-user");
        setWalletBalance(data.balance);
      } catch (error) {
        console.error('Failed to fetch wallet balance:', error);
      }
    };

    fetchBalance();
    // ポーリングなどで定期更新も検討
  }, []);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/play', icon: Gamepad2, label: 'Play' },
    { path: '/dock', icon: Library, label: 'Card Dock' }, // Replaced Library or added new? Let's add new or replace. Plan said "Card Dock".
    { path: '/library', icon: Library, label: 'Library' },
    { path: '/tickets', icon: Ticket, label: 'Tickets' },
    { path: '/redeem', icon: Gift, label: 'Redeem' },
  ];

  return (
    <>
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            IZAKAYA verse
          </Link>

          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Wallet Balance */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full border border-gray-700">
            <Wallet size={18} className="text-yellow-500" />
            <span className="text-white font-mono font-bold">
              {walletBalance !== null ? walletBalance.toLocaleString() : '---'}
            </span>
            <span className="text-xs text-gray-400">PTS</span>
          </div>

          {/* Help Button */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Help"
          >
            <HelpCircle size={24} />
          </button>
        </div>
      </nav>

      <HelpDrawer isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
};

export default Navigation;
