# NPC Systems & AI Architecture

## Overview
Arcane Realms features a sophisticated NPC system where characters exhibit realistic behaviors, maintain complex social relationships, and provide dynamic quest content. This document outlines the technical architecture and design principles behind the AI-driven NPC experience.

> **TODO:** Document the runtime frameworks and libraries used to implement these NPC systems.

## NPC AI Architecture

### Core AI Components
```
NPC AI System
├── Personality Engine
│   ├── Core Traits & Values
│   ├── Emotional States
│   └── Behavioral Patterns
├── Memory System
│   ├── Player Interaction History
│   ├── World Event Knowledge
│   └── Relationship Mapping
├── Dialogue System
│   ├── Context-Aware Responses
│   ├── Quest Management
│   └── Social Interaction Scripts
└── Behavior Engine
    ├── Daily Routine Scheduler
    ├── Pathfinding & Movement
    └── Inter-NPC Communication
```

### Dialogue & Language Processing
- **LLM Integration**: Ollama provides natural language understanding and generation
- **Context Injection**: NPCs receive real-time context about player history, world state, and ongoing quests
- **Function Calling**: NPCs can trigger game actions (quest assignment, item trading, skill teaching)
- **Conversation Memory**: Each interaction is stored and referenced in future conversations
- **Voice Support**: Optional STT/TTS for immersive voice interactions
> **TODO:** Explain how dialogue latency is managed and what happens if the LLM service times out.

## Quest System Architecture

### Quest State Management
```python
class Quest:
    id: str
    title: str
    description: str
    giver_npc_id: str
    type: QuestType  # SHARED, COMPETITIVE, UNIQUE
    max_completions: int
    current_completions: int
    accepted_by: List[PlayerId]
    completed_by: List[PlayerId]
    prerequisites: List[QuestId]
    rewards: List[Reward]
    expiration: Optional[DateTime]
```

### Quest Types
- **Shared Quests**: Multiple players can complete independently
- **Competitive Quests**: Race-based, first completion gets best rewards
- **Unique Quests**: One-time only, permanently removes quest from pool
- **Chain Quests**: Sequential quests that unlock based on community progress
- **Seasonal Quests**: Time-limited special events

### Dynamic Quest Generation
- **Template System**: Procedural quest generation using configurable templates
- **Context Awareness**: New quests consider regional history and player actions
- **Difficulty Scaling**: Quest complexity adapts to player level and regional progression
- **Resource Integration**: Quests utilize available NPCs, locations, and items in the area

## NPC Behavior Systems

### Daily Routine Engine
```python
class NPCSchedule:
    npc_id: str
    routines: Dict[TimeOfDay, Activity]
    locations: Dict[ActivityType, Location]
    variations: List[ScheduleVariation]
    special_events: List[ScheduleOverride]
```

> **TODO:** Specify the pathfinding algorithm and how movement meshes are generated for NPC navigation.

### Activity Types
- **Work**: Profession-based activities (blacksmith, merchant, guard)
- **Social**: Visiting friends, attending events, casual conversations
- **Personal**: Eating, sleeping, recreation
- **Errands**: Shopping, maintenance, civic duties
- **Random**: Spontaneous activities that add life to the world

### Movement & Pathfinding
- **Smart Pathfinding**: NPCs navigate around obstacles and other NPCs
- **Social Awareness**: NPCs acknowledge and interact with nearby characters
- **Collision Avoidance**: Realistic movement that prevents NPC clustering
- **Contextual Speed**: Walking speed varies based on activity and urgency

## Inter-NPC Social System

### Relationship Framework
```python
class NPCRelationship:
    npc_a_id: str
    npc_b_id: str
    relationship_type: RelationshipType
    affinity_score: float  # -100 to +100
    history: List[InteractionEvent]
    shared_interests: List[Topic]
    conversation_frequency: float
```

> **TODO:** Clarify how long-term memory persistence is stored and synchronized across servers.

### Conversation System
- **Trigger Conditions**: NPCs converse when paths cross based on relationship and context
- **Topic Selection**: Conversations cover relevant local events, player actions, and personal interests
- **Duration Management**: Conversations have natural start/end points based on NPC schedules
- **Player Overhearing**: Players can listen in on conversations for hints and lore

### Information Propagation
- **Gossip Network**: Information spreads between NPCs based on social connections
- **Reputation Impact**: Player actions become known throughout NPC communities
- **Rumor Generation**: NPCs create and share rumors about world events and player activities
- **Truth Decay**: Information becomes less accurate as it spreads through the network

## Technical Implementation

### Performance Optimization
- **Behavior Culling**: NPC AI complexity reduces when no players are nearby
- **Schedule Caching**: Pre-computed schedules reduce real-time AI overhead
- **Conversation Pooling**: Limit simultaneous NPC conversations to prevent performance issues
- **Memory Management**: Efficient storage and retrieval of NPC interaction history

### Scalability Considerations
- **Distributed Processing**: NPC AI can be distributed across multiple servers
- **Load Balancing**: Dynamic allocation of NPCs based on player population
- **State Synchronization**: Consistent NPC behavior across different game instances
- **Backup Systems**: Graceful degradation when AI services are unavailable

### Data Persistence
- **Relationship Storage**: NPC relationships and interaction history in persistent database
- **Schedule Versioning**: Track changes to NPC routines over time
- **Conversation Logs**: Store significant conversations for future reference
- **Quest History**: Maintain complete record of quest interactions and outcomes

## Quality Assurance

### Behavioral Testing
- **Routine Validation**: Ensure NPC schedules are realistic and engaging
- **Conversation Quality**: Regular review of AI-generated dialogue for appropriateness
- **Quest Balance**: Monitor completion rates and player satisfaction with dynamic quests
- **Performance Monitoring**: Track AI processing times and resource usage

### Player Experience Metrics
- **Engagement Tracking**: Monitor player interactions with NPCs
- **Quest Completion Analysis**: Identify popular and ignored quest types
- **Social Feature Usage**: Track player participation in NPC social systems
- **Bug Reporting**: Systems for players to report NPC behavioral issues

## Future Enhancements

### Advanced AI Features
- **Emotional Intelligence**: NPCs that recognize and respond to player emotional states
- **Long-term Memory**: NPCs that remember player actions across extended time periods
- **Cultural Simulation**: Different NPC communities with distinct behavioral patterns
- **Political Systems**: NPCs with factional allegiances and political agendas

### Enhanced Social Features
- **Player-NPC Relationships**: Deep relationship building with individual NPCs
- **NPC Companions**: NPCs that can join players on adventures
- **Community Events**: Large-scale events coordinated by NPC organizers
- **Economic Simulation**: NPCs participating in complex economic systems

### Technical Improvements
- **Machine Learning Integration**: NPCs that learn from player behavior patterns
- **Real-time Adaptation**: NPCs that adjust behavior based on current world state
- **Cross-Platform Consistency**: Synchronized NPC behavior across all game platforms
- **Modding Support**: Tools for players to create and share custom NPC behaviors
