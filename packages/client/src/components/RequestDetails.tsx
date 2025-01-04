import useProxyStore from "../store/proxyStore";

export const RequestDetails = () => {
    const { events, selectedEventId } = useProxyStore();
    const selectedEvent = events.find(e => e.id === selectedEventId);

    if (!selectedEvent) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500">
                Select a request to view details
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-gray-900 p-4">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-white">Request Details</h2>
            </div>

            <div className="flex-1 overflow-auto">
                <div className="space-y-4">
                    {/* General Info */}
                    <div className="bg-gray-800 p-4 rounded">
                        <h3 className="text-sm font-medium text-gray-300 mb-2">General</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="text-gray-500">Method</div>
                            <div className="text-white">{selectedEvent.method}</div>
                            <div className="text-gray-500">Path</div>
                            <div className="text-white">{selectedEvent.path}</div>
                            <div className="text-gray-500">Duration</div>
                            <div className="text-white">{selectedEvent.duration}ms</div>
                        </div>
                    </div>

                    {/* Request */}
                    <div className="bg-gray-800 p-4 rounded">
                        <h3 className="text-sm font-medium text-gray-300 mb-2">Request</h3>
                        <div className="bg-gray-900 p-2 rounded">
                            <pre className="text-sm text-gray-300 overflow-auto">
                                {JSON.stringify(selectedEvent.requestBody, null, 2)}
                            </pre>
                        </div>
                    </div>

                    {/* Response */}
                    <div className="bg-gray-800 p-4 rounded">
                        <h3 className="text-sm font-medium text-gray-300 mb-2">Response</h3>
                        <div className="bg-gray-900 p-2 rounded">
                            <pre className="text-sm text-gray-300 overflow-auto">
                                {JSON.stringify(selectedEvent.responseBody, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}