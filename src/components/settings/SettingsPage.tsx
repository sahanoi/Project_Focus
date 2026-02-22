import React, { useRef, useState } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { useAuth } from '../../contexts/AuthContext';
import { Download, Upload, Trash2, AlertTriangle, Info, Database, LogOut, User, Shield, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
    const { habits, goals, importData, clearAllData, loadDummyData } = useHabitStore();
    const { user, signOut } = useAuth();
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [importStatus, setImportStatus] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const data = JSON.stringify({ habits, goals }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `focus-ftp-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target?.result as string);
                if (!data.habits || !Array.isArray(data.habits)) {
                    setImportStatus('Invalid file format. Expected { habits: [], goals: [] }');
                    return;
                }
                importData({
                    habits: data.habits,
                    goals: data.goals || [],
                });
                setImportStatus(`Successfully imported ${data.habits.length} habits! ✅`);
                setTimeout(() => setImportStatus(null), 3000);
            } catch {
                setImportStatus('Failed to parse file. Make sure it\'s valid JSON.');
            }
        };
        reader.readAsText(file);

        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleClear = () => {
        clearAllData();
        setShowClearConfirm(false);
    };

    const activeCount = habits.filter(h => !h.archived).length;
    const archivedCount = habits.filter(h => h.archived).length;
    const totalCompletions = habits.reduce((sum, h) => sum + Object.keys(h.completions).length, 0);

    return (
        <div className="max-w-2xl mx-auto p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-black text-dark tracking-tight">Settings</h2>
            </div>

            {/* Profile Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-[#E6DDF2] p-6 shadow-sm"
            >
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-tr from-primary to-primary-light rounded-2xl flex items-center justify-center shadow-md shadow-primary/15">
                        <span className="text-white font-black text-xl">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-dark text-lg">
                            {user?.user_metadata?.username || user?.email?.split('@')[0] || 'Player'}
                        </p>
                        <p className="text-sm text-dark-lighter">{user?.email}</p>
                    </div>
                    <button
                        onClick={signOut}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-dark-lighter hover:text-danger hover:bg-danger/5 border border-[#E6DDF2] transition-all text-sm font-medium"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="grid grid-cols-4 gap-3"
            >
                {[
                    { label: 'Total', value: habits.length, icon: '📊' },
                    { label: 'Active', value: activeCount, icon: '⚡' },
                    { label: 'Goals', value: goals.length, icon: '🎯' },
                    { label: 'Logged', value: totalCompletions, icon: '✅' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-xl border border-[#E6DDF2] p-4 text-center shadow-sm">
                        <span className="text-lg mb-1 block">{stat.icon}</span>
                        <span className="text-xl font-black text-dark block">{stat.value}</span>
                        <span className="text-[10px] text-dark-lighter uppercase tracking-wider font-semibold">{stat.label}</span>
                    </div>
                ))}
            </motion.div>

            {/* Data Management */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-[#E6DDF2] p-6 shadow-sm space-y-4"
            >
                <h3 className="font-bold text-dark flex items-center gap-2">
                    <Package size={18} className="text-primary" />
                    Data Management
                </h3>

                <p className="text-sm text-dark-lighter">
                    Your data syncs to the cloud via Supabase. Export regularly as an extra backup.
                </p>

                <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleExport} className="btn-primary flex items-center gap-2 justify-center text-sm">
                        <Download size={16} />
                        Export JSON
                    </button>

                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="hidden"
                            id="import-file"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="btn-secondary flex items-center gap-2 w-full justify-center text-sm"
                        >
                            <Upload size={16} />
                            Import JSON
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {importStatus && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`p-3 rounded-xl text-sm font-medium ${importStatus.includes('Successfully') ? 'bg-success/5 text-success-dark border border-success/20' : 'bg-danger/5 text-danger border border-danger/20'
                                }`}
                        >
                            {importStatus}
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={loadDummyData}
                    className="btn-secondary flex items-center gap-2 w-full justify-center text-sm"
                >
                    <Database size={16} />
                    Load Demo Data (Preview)
                </button>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl border border-danger/15 p-6 shadow-sm space-y-4"
            >
                <h3 className="font-bold text-danger flex items-center gap-2">
                    <Shield size={18} />
                    Danger Zone
                </h3>

                {!showClearConfirm ? (
                    <button
                        onClick={() => setShowClearConfirm(true)}
                        className="flex items-center gap-2 w-full justify-center px-4 py-2.5 rounded-xl border border-danger/20 text-danger text-sm font-medium hover:bg-danger/5 transition-all"
                    >
                        <Trash2 size={16} />
                        Clear All Data
                    </button>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-danger/5 rounded-xl border border-danger/20 space-y-3"
                    >
                        <div className="flex items-start gap-2">
                            <AlertTriangle size={18} className="text-danger flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-danger font-medium">
                                This will permanently delete all your habits, completions, and goals. This cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setShowClearConfirm(false)} className="btn-secondary flex-1 text-sm">
                                Cancel
                            </button>
                            <button onClick={handleClear} className="btn-danger flex-1 text-sm">
                                Yes, Delete Everything
                            </button>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* About */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-[#E6DDF2] p-6 shadow-sm"
            >
                <h3 className="font-bold text-dark mb-2 flex items-center gap-2">
                    <Info size={18} className="text-primary" />
                    About
                </h3>
                <p className="text-sm text-dark-lighter leading-relaxed">
                    <span className="font-semibold text-dark">Focus FTP v3.0</span> — Your gamified habit companion. Track habits, level up your character, and build lasting discipline.
                </p>
                <p className="text-xs text-dark-lighter/50 mt-2">Made with ❤️ and framer-motion</p>
            </motion.div>
        </div>
    );
}
