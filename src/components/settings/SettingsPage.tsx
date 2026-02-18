import React, { useRef, useState } from 'react';
import { useHabitStore } from '../../store/habitStore';
import { useAuth } from '../../contexts/AuthContext';
import { Download, Upload, Trash2, AlertTriangle, Info, Moon, Sun, Database, LogOut, User } from 'lucide-react';

export default function SettingsPage() {
    const { habits, goals, importData, clearAllData, darkMode, toggleDarkMode, loadDummyData } = useHabitStore();
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
        a.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
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

    return (
        <div className="max-w-lg mx-auto space-y-6">
            <h2 className="text-xl font-bold text-dark">⚙️ Settings</h2>

            {/* Appearance */}
            <div className="card space-y-4">
                <h3 className="section-title flex items-center gap-2">
                    {darkMode ? <Moon size={18} className="text-purple" /> : <Sun size={18} className="text-warning" />}
                    Appearance
                </h3>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-sm">Dark Mode</p>
                        <p className="text-xs text-gray-500">Switch between light and dark theme</p>
                    </div>
                    <button
                        onClick={toggleDarkMode}
                        className={`toggle-switch ${darkMode ? 'bg-primary' : 'bg-gray-300'}`}
                    >
                        <span
                            className={`toggle-switch-knob ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`}
                        />
                    </button>
                </div>
            </div>

            {/* Data Management */}
            <div className="card space-y-4">
                <h3 className="section-title flex items-center gap-2">
                    <Info size={18} className="text-primary" />
                    Data Management
                </h3>

                <p className="text-sm text-gray-500">
                    Your data is stored locally in your browser. Export regularly to avoid data loss.
                </p>

                {/* Export */}
                <button onClick={handleExport} className="btn-primary flex items-center gap-2 w-full justify-center">
                    <Download size={18} />
                    Export Data as JSON
                </button>

                {/* Import */}
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
                        className="btn-secondary flex items-center gap-2 w-full justify-center"
                    >
                        <Upload size={18} />
                        Import Data from JSON
                    </button>
                </div>

                {importStatus && (
                    <div className={`p-3 rounded-lg text-sm font-medium ${importStatus.includes('Successfully') ? 'bg-green-50 text-success border-2 border-success' : 'bg-red-50 text-danger border-2 border-danger'
                        }`}>
                        {importStatus}
                    </div>
                )}

                {/* Load Demo Data */}
                <button
                    onClick={loadDummyData}
                    className="btn-secondary flex items-center gap-2 w-full justify-center"
                >
                    <Database size={18} />
                    🧪 Load Demo Data (Preview)
                </button>

                {/* Clear Data */}
                <hr className="border-gray-200" />

                {!showClearConfirm ? (
                    <button
                        onClick={() => setShowClearConfirm(true)}
                        className="btn-danger flex items-center gap-2 w-full justify-center opacity-80 hover:opacity-100"
                    >
                        <Trash2 size={18} />
                        🗑️ Clear All Data
                    </button>
                ) : (
                    <div className="p-4 bg-red-50 rounded-lg border-2 border-danger space-y-3">
                        <div className="flex items-start gap-2">
                            <AlertTriangle size={20} className="text-danger flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-danger font-semibold">
                                ⚠️ This will permanently delete all your habits, completions, and goals. This cannot be undone.
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
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="card">
                <h3 className="section-title mb-3">📊 Storage Info</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Total Habits</span>
                        <span className="font-bold text-dark">{habits.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Active Habits</span>
                        <span className="font-bold text-dark">{habits.filter((h) => !h.archived).length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Archived Habits</span>
                        <span className="font-bold text-dark">{habits.filter((h) => h.archived).length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Goals</span>
                        <span className="font-bold text-dark">{goals.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Total Completions</span>
                        <span className="font-bold text-dark">
                            {habits.reduce((sum, h) => sum + Object.keys(h.completions).length, 0)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Account */}
            <div className="card space-y-4">
                <h3 className="section-title flex items-center gap-2">
                    <User size={18} className="text-primary" />
                    Account
                </h3>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-sm">Signed in as</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                </div>

                <button
                    onClick={signOut}
                    className="btn-danger flex items-center gap-2 w-full justify-center opacity-80 hover:opacity-100"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>

            {/* About */}
            <div className="card">
                <h3 className="section-title mb-2">ℹ️ About</h3>
                <p className="text-sm text-gray-500">
                    Project Focus v3.0 — Your life companion. Track habits, finances, goals, and more.
                    Sharp · Hard · Fun 🚀
                </p>
            </div>
        </div>
    );
}
