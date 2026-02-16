import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Briefcase, FolderOpen, Image,
  Settings, MessageSquare, Star, HelpCircle, ClipboardList, X,
} from 'lucide-react';
import Logo from '../../components/Logo';

const navItems = [
  { label: 'דשבורד', path: '/admin', icon: LayoutDashboard },
  { label: 'דפים', path: '/admin/pages', icon: FileText },
  { label: 'שירותים', path: '/admin/services', icon: Briefcase },
  { label: 'קטגוריות', path: '/admin/categories', icon: FolderOpen },
  { label: 'ספריית מדיה', path: '/admin/media', icon: Image },
  { label: 'המלצות', path: '/admin/testimonials', icon: Star },
  { label: 'שאלות נפוצות', path: '/admin/faq', icon: HelpCircle },
  { label: 'פניות', path: '/admin/contacts', icon: MessageSquare },
  { label: 'הגדרות אתר', path: '/admin/settings', icon: Settings },
  { label: 'יומן פעולות', path: '/admin/audit', icon: ClipboardList },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-slate-900 text-white z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : 'translate-x-full'
        } lg:static lg:z-auto`}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-700 min-h-[64px]">
          <div className="overflow-hidden max-w-[170px]">
            <Logo to="/admin" className="text-white" prefixClass="text-slate-400" context="sidebar" />
            <span className="block text-xs text-slate-500 font-normal mt-0.5">פאנל ניהול</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-80px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
