---
title: Gaming Machine Integration API
description: Develop an API integration layer for gaming machines with real-time event streaming, protocol handling, and compliance monitoring
version: 1.0.0
author: Prompt Manager MCP
created: 2026-01-18
tags:
  role: [developer]
  task-type: [code-generation]
  module: [gaming-ops]
  compliance: [casino-control-act, audit-logging]
  complexity: [advanced]
  ai-agent-persona: [code-generator]
---

# Gaming Machine Integration API

You are tasked with developing an API integration layer for gaming machines (slot machines, video poker, etc.) in a casino management system.

## Context

The gaming operations module needs to communicate with various types of gaming machines to:
- Monitor machine status and performance
- Track player activity and gameplay
- Handle progressive jackpots
- Manage machine configurations
- Collect meter readings for compliance

## Requirements

1. **API Integration**
   - Support multiple gaming machine protocols (SAS, G2S, OASIS)
   - Implement bidirectional communication
   - Handle real-time events from machines
   - Support batch meter collection

2. **Data Collection**
   ```typescript
   interface MachineData {
     machineId: string;
     assetNumber: string;
     status: 'online' | 'offline' | 'maintenance' | 'error';
     meters: {
       gamesPlayed: number;
       coinIn: number;
       coinOut: number;
       jackpots: number;
       lastUpdate: Date;
     };
     currentPlayer?: {
       playerId: string;
       sessionStart: Date;
       currentBet: number;
     };
   }
   ```

3. **Event Handling**
   - Machine door open/close
   - Tilt conditions
   - Bill validator events
   - Jackpot hits
   - Communication errors

4. **Error Recovery**
   - Automatic reconnection on connection loss
   - Queue events during downtime
   - Validate data integrity
   - Log all communication errors

5. **Performance**
   - Support monitoring 1000+ machines concurrently
   - Process events within 100ms
   - Minimal impact on machine performance
   - Efficient data serialization

## Technical Stack

- Node.js/TypeScript
- WebSocket or TCP/IP for machine communication
- Redis for event queue
- PostgreSQL for data persistence
- Event-driven architecture

## Output Requirements

Provide:
1. API integration layer implementation
2. Event handler system
3. Error recovery mechanisms
4. Data validation logic
5. Performance optimization strategies
6. Integration tests

## Success Criteria

- Successfully connects to multiple machine types
- Handles all defined event types
- Recovers gracefully from errors
- Meets performance requirements
- Comprehensive logging and monitoring
