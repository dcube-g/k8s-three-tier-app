## System Architecture Stack
- **AI Gateway Endpoint**: http://localhost:8787/v1 (Headroom Proxy Layer)
- **Token Reductions Active**: OmniRoute (Fallback Routing) + Headroom (Context Compression) + Graphify (AST Graph Engine)

## Nightly Agent Routine
Run at 2:00 AM daily.
1. Run local system validation via terminal command: `graphify build` to refresh codebase maps.
2. Scan the generated `graphify-out/GRAPH_REPORT.md` file to ingest system architecture changes.
3. Check active files, pull the highest priority issues from git tracking, and write a summary log.
## Behavioral Directives & Token Optimizations
- **Communication Style**: Be exceptionally direct, terse, and concise. Eliminate all pleasantries, greetings, introductions, transitions, and conversational filler text. 
- **Response Format**: Do not wrap code responses in structural conversational wrappers or repeat what the user asked. Output the exact modification patches, code blocks, or tool execution steps immediately.
- **Explanation Control**: Never over-explain architecture patterns or code lines unless explicitly asked to do so with the `/explain` tool flag. Assume an advanced developer reading level.
- **Token Efficiency**: Focus heavily on editing specific lines of code rather than generating entire files from scratch. Minimize context expansion.

