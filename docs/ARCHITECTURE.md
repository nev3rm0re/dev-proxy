System design and component relationships

The app consists of a proxy server and it's configuration client. The proxy server is intercepting requests and passing them to the target server, and then passing the response back to the client. This behavior is controlled by the configuration, which can be edited through the API and the frontend app, served on a different port. 

Proxy server is running on port 9001, as this is mostly unused port, globally. Client for editing configuration and monitoring requests/responses is running on port 9000.

When proxy server is sending response back to the client, it broadcasts the response to the websocket, which is then used by the client to update the UI.

Broadcasted response includes the original request, so the client can see the request that triggered the response.


Client app consists of:

- `Layout` - main layout of the app, handles websocket connection, and state management
- `Rules` - component for creating and managing rules
- `RulesForm` - form for creating a new rule
- `RulesList` - list of existing rules
- `RuleItem` - individual rule item in the list

