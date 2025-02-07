import { useState, useEffect } from "react";
import { X, Edit2, Star, StarOff, Info, ArrowLeft } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Link } from "react-router-dom";

interface Server {
  id: string;
  name: string;
  url: string;
  isDefault: boolean;
}

interface EditingServer extends Server {
  originalName: string;
  originalUrl: string;
}

export const Settings = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [newServer, setNewServer] = useState({ name: "", url: "" });
  const [editingServer, setEditingServer] = useState<EditingServer | null>(
    null
  );

  useEffect(() => {
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      const response = await fetch("/api/settings/servers");
      const data = await response.json();
      setServers(data);
    } catch (error) {
      console.error("Failed to fetch servers:", error);
    }
  };

  const handleAddServer = async () => {
    try {
      const response = await fetch("/api/settings/servers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newServer),
      });
      const data = await response.json();
      setServers([...servers, data]);
      setNewServer({ name: "", url: "" });
    } catch (error) {
      console.error("Failed to add server:", error);
    }
  };

  const handleEditServer = async () => {
    if (!editingServer) return;

    try {
      const response = await fetch(
        `/api/settings/servers/${editingServer.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editingServer.name,
            url: editingServer.url,
          }),
        }
      );

      if (response.ok) {
        setServers(
          servers.map((server) =>
            server.id === editingServer.id
              ? { ...server, name: editingServer.name, url: editingServer.url }
              : server
          )
        );
        setEditingServer(null);
      }
    } catch (error) {
      console.error("Failed to edit server:", error);
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
        method: "POST",
      });
      fetchServers(); // Refresh the list
    } catch (error) {
      console.error("Failed to set default server:", error);
    }
  };

  const handleDeleteServer = async (serverId: string) => {
    try {
      await fetch(`/api/settings/servers/${serverId}`, {
        method: "DELETE",
      });
      setServers(servers.filter((server) => server.id !== serverId));
    } catch (error) {
      console.error("Failed to delete server:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <div className="grid grid-cols-[200px_1fr_200px] p-3 border-b border-gray-800">
        <div className="flex items-center">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back</span>
          </Link>
        </div>
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-lg font-medium text-white">Settings</h2>
          <Tooltip.Provider>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button className="text-gray-400 hover:text-gray-300">
                  <Info size={16} />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-gray-800 text-white p-3 rounded-lg shadow-lg text-sm max-w-xs"
                  sideOffset={5}
                >
                  The default server will be used for URLs/paths that don't have
                  a domain name as the first part of the URL
                  <Tooltip.Arrow className="fill-gray-800" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>
        <div /> {/* Empty div for grid alignment */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 space-y-2">
          {/* Server List */}
          {servers.map((server) => (
            <div
              key={server.id}
              className="flex items-center justify-between p-3 bg-gray-800 rounded hover:bg-gray-700"
            >
              {editingServer?.id === server.id ? (
                <>
                  <div className="flex-1 grid grid-cols-2 gap-4 mr-4">
                    <input
                      type="text"
                      value={editingServer.name}
                      onChange={(e) =>
                        setEditingServer({
                          ...editingServer,
                          name: e.target.value,
                        })
                      }
                      className="bg-gray-900 text-white px-3 py-1.5 rounded border border-gray-700 focus:outline-none focus:border-gray-500"
                    />
                    <input
                      type="text"
                      value={editingServer.url}
                      onChange={(e) =>
                        setEditingServer({
                          ...editingServer,
                          url: e.target.value,
                        })
                      }
                      className="bg-gray-900 text-white px-3 py-1.5 rounded border border-gray-700 focus:outline-none focus:border-gray-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleEditServer}
                      className="px-3 py-1.5 bg-green-600/20 text-green-400 rounded hover:bg-green-600/30"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="font-medium text-white">{server.name}</div>
                    <div className="text-gray-300">{server.url}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleSetDefault(server.id)}
                      className="text-gray-400 hover:text-yellow-400"
                      title={
                        server.isDefault ? "Default server" : "Set as default"
                      }
                    >
                      {server.isDefault ? (
                        <Star
                          className="fill-yellow-400 text-yellow-400"
                          size={18}
                        />
                      ) : (
                        <StarOff size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => startEditing(server)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteServer(server.id)}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Add New Server Form */}
          <div className="flex gap-4 p-3 bg-gray-800 rounded mt-4">
            <input
              type="text"
              placeholder="Server name"
              value={newServer.name}
              onChange={(e) =>
                setNewServer({ ...newServer, name: e.target.value })
              }
              className="flex-1 bg-gray-900 text-white px-3 py-1.5 rounded border border-gray-700 focus:outline-none focus:border-gray-500"
            />
            <input
              type="text"
              placeholder="Server URL"
              value={newServer.url}
              onChange={(e) =>
                setNewServer({ ...newServer, url: e.target.value })
              }
              className="flex-1 bg-gray-900 text-white px-3 py-1.5 rounded border border-gray-700 focus:outline-none focus:border-gray-500"
            />
            <button
              onClick={handleAddServer}
              disabled={!newServer.name || !newServer.url}
              className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Server
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
