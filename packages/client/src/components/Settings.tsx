import { useState, useEffect } from 'react';
import { X, Edit2, Check, XCircle } from 'lucide-react';

interface Server {
    id: string;
    name: string;
    url: string;
    isDefault: boolean;
}

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

interface EditingServer extends Server {
    originalName: string;
    originalUrl: string;
}

export const Settings = ({ isOpen, onClose }: SettingsProps) => {
    const [servers, setServers] = useState<Server[]>([]);
    const [newServer, setNewServer] = useState({ name: '', url: '' });
    const [editingServer, setEditingServer] = useState<EditingServer | null>(null);

    useEffect(() => {
        fetchServers();
    }, []);

    const fetchServers = async () => {
        try {
            const response = await fetch('/api/settings/servers');
            const data = await response.json();
            setServers(data);
        } catch (error) {
            console.error('Failed to fetch servers:', error);
        }
    };

    const handleAddServer = async () => {
        try {
            const response = await fetch('/api/settings/servers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newServer),
            });
            const data = await response.json();
            setServers([...servers, data]);
            setNewServer({ name: '', url: '' });
        } catch (error) {
            console.error('Failed to add server:', error);
        }
    };

    const handleEditServer = async () => {
        if (!editingServer) return;

        try {
            const response = await fetch(`/api/settings/servers/${editingServer.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: editingServer.name,
                    url: editingServer.url,
                }),
            });
            
            if (response.ok) {
                setServers(servers.map(server => 
                    server.id === editingServer.id 
                        ? { ...server, name: editingServer.name, url: editingServer.url }
                        : server
                ));
                setEditingServer(null);
            }
        } catch (error) {
            console.error('Failed to edit server:', error);
            // Revert changes on error
            if (editingServer) {
                setEditingServer({
                    ...editingServer,
                    name: editingServer.originalName,
                    url: editingServer.originalUrl,
                });
            }
        }
    };

    const startEditing = (server: Server) => {
        setEditingServer({
            ...server,
            originalName: server.name,
            originalUrl: server.url,
        });
    };

    const cancelEditing = () => {
        setEditingServer(null);
    };

    const handleSetDefault = async (serverId: string) => {
        try {
            await fetch(`/api/settings/servers/${serverId}/default`, {
                method: 'POST',
            });
            fetchServers(); // Refresh the list
        } catch (error) {
            console.error('Failed to set default server:', error);
        }
    };

    const handleDeleteServer = async (serverId: string) => {
        try {
            await fetch(`/api/settings/servers/${serverId}`, {
                method: 'DELETE',
            });
            setServers(servers.filter(server => server.id !== serverId));
        } catch (error) {
            console.error('Failed to delete server:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-[500px] relative">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">Settings</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-medium text-white mb-4">Servers</h3>
                    
                    <div className="space-y-4">
                        {servers.map((server) => (
                            <div key={server.id} className="flex items-center gap-4 bg-gray-700 p-3 rounded">
                                {editingServer?.id === server.id ? (
                                    <>
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                value={editingServer.name}
                                                onChange={(e) => setEditingServer({
                                                    ...editingServer,
                                                    name: e.target.value
                                                })}
                                                className="w-full bg-gray-600 text-white px-2 py-1 rounded"
                                            />
                                            <input
                                                type="text"
                                                value={editingServer.url}
                                                onChange={(e) => setEditingServer({
                                                    ...editingServer,
                                                    url: e.target.value
                                                })}
                                                className="w-full bg-gray-600 text-white px-2 py-1 rounded"
                                            />
                                        </div>
                                        <button
                                            onClick={handleEditServer}
                                            className="text-green-400 hover:text-green-300"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <XCircle size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex-1">
                                            <div className="font-medium text-white">{server.name}</div>
                                            <div className="text-sm text-gray-400">{server.url}</div>
                                        </div>
                                        <button
                                            onClick={() => startEditing(server)}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleSetDefault(server.id)}
                                            className={`px-2 py-1 rounded text-sm ${
                                                server.isDefault
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                            }`}
                                        >
                                            {server.isDefault ? 'Default' : 'Set Default'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteServer(server.id)}
                                            className="text-gray-400 hover:text-red-400"
                                        >
                                            <X size={16} />
                                        </button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 space-y-3">
                        <input
                            type="text"
                            placeholder="Server name"
                            value={newServer.name}
                            onChange={(e) => setNewServer({ ...newServer, name: e.target.value })}
                            className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                        />
                        <input
                            type="text"
                            placeholder="Server URL"
                            value={newServer.url}
                            onChange={(e) => setNewServer({ ...newServer, url: e.target.value })}
                            className="w-full bg-gray-700 text-white px-3 py-2 rounded"
                        />
                        <button
                            onClick={handleAddServer}
                            disabled={!newServer.name || !newServer.url}
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add Server
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}; 