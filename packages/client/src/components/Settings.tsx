import { ArrowLeft, Info } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Link } from "react-router-dom";

export const Settings = () => {
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
                  Configure your proxy behavior using rules in the main
                  interface
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
        <div className="p-6 space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-medium text-white mb-4">
              Rule-Based Proxy
            </h3>
            <p className="text-gray-300 mb-4">
              This proxy now operates entirely through rules. Configure your
              routing behavior by creating and managing rules in the main
              interface.
            </p>

            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-white mb-2">
                  Domain Rules
                </h4>
                <p className="text-gray-400 text-sm">
                  Automatically route requests based on domain names in the URL
                  path. For example:{" "}
                  <code className="bg-gray-700 px-1 rounded">
                    /api.example.com/users
                  </code>
                  will route to{" "}
                  <code className="bg-gray-700 px-1 rounded">
                    https://api.example.com/users
                  </code>
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-white mb-2">
                  Forwarding Rules
                </h4>
                <p className="text-gray-400 text-sm">
                  Create custom forwarding rules to route specific patterns to
                  target servers. Configure method filters, path patterns, and
                  target URLs.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-white mb-2">
                  Rule Priority
                </h4>
                <p className="text-gray-400 text-sm">
                  Rules are processed in order. Use the Rules tab to reorder
                  them as needed. Terminating rules will stop processing further
                  rules.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded">
              <p className="text-blue-300 text-sm">
                💡 <strong>Tip:</strong> Go to the Rules tab to create and
                manage your proxy rules. Start with a "Forward all requests"
                rule or enable "Domain routing" for automatic domain-based
                forwarding.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
