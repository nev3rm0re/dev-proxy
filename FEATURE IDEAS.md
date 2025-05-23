## Feature Ideas

- [x] Allow to select response to send back
- [x] Edit locked route's response body
- [x] Add "Server settings"
    - [x] Allow to work on `/` path - Set default "project"
    - [x] Write unit test for this functionality
- [x] Clear session
- [ ] Allow "replaying" requests
- [ ] Preserve log should be optional
- [x] Add search/filter functionality
- [ ] Add responses manually with differentiation between manually created and proxied
- [ ] Allow adding/copying responses
- [ ] Add routes manually
    - [ ] Add "wildcard" routes
- [ ] Export/import config/settings, from/to Swagger
- [ ] Edit response headers and other details
- [ ] More types of events: req start, res received, loading indicator
- [ ] Simulate latency
- [ ] API Docs?

---

## v0.2: Rules System & Next Steps

- [ ] Add a new "Rules" tab to the UI for managing proxy rules
- [ ] Support multiple rule types:
    - [ ] Pass-through (default, current behavior)
    - [ ] Cache/Freeze: return predefined response (captured or manually set)
    - [ ] Plugin: forward/modify requests to other APIs (e.g., for AI integration, CSV/JSON transformation, etc.)
- [ ] Allow capturing and editing responses for cache/freeze rules
- [ ] UI for creating, editing, and reordering rules
- [ ] Foundation for plugin system (initial design/experimentation)