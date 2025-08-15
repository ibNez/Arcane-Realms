# Dynamic Asset Generation System

## Overview
Arcane Realms employs an **AI-powered dynamic asset generation system** using Stable Diffusion to create contextually appropriate environmental visuals. This system transforms base architectural and environmental components based on biome characteristics, historical context, and player actions, creating a living world that visually evolves and adapts.

> **TODO:** Add a diagram of the asset-generation pipeline and list external services or libraries required.

## Core Philosophy

### Functional Aesthetics
- **Gameplay First**: Visual modifications never compromise gameplay mechanics or clarity
- **Contextual Immersion**: Every asset reflects its environment and history
- **Infinite Variety**: No two regions look identical, even with similar base components
- **Performance Conscious**: Smart caching and optimization maintain smooth gameplay

### Visual Consistency
- **Regional Coherence**: Assets within a biome share visual language and style
- **Functional Recognition**: Players can always identify asset types and interactions
- **Progressive Enhancement**: Base assets provide fallback while enhanced versions generate
- **Style Persistence**: Generated variations maintain artistic consistency
> **TODO:** Describe content moderation steps to ensure generated assets remain safe and lore-friendly.

## Base Asset Library

The foundational assets are cataloged in
[asset-catalog.md](asset-catalog.md) and mirrored in a SQLite database
(`ops/data/assets.db`) so generation and gameplay systems share the same
authoritative metadata.

> **TODO:** Explain how the asset catalog is versioned and synchronized between the database and this document.

### Architectural Foundation
```
Building Components
├── Structures
│   ├── Houses (cottage, manor, hut, apartment)
│   ├── Commercial (shop, tavern, market, workshop)
│   ├── Civic (temple, town hall, guard house)
│   └── Defensive (tower, fort, walls, gates)
├── Infrastructure
│   ├── Transportation (roads, bridges, docks)
│   ├── Utilities (wells, mills, storage)
│   └── Agricultural (farms, barns, fields)
└── Decorative
    ├── Monuments (statues, fountains, memorials)
    ├── Landscaping (gardens, parks, plazas)
    └── Signage (signs, banners, markers)
```

### Environmental Elements
```
Natural Features
├── Terrain
│   ├── Geological (rocks, cliffs, caves, hills)
│   ├── Water (rivers, ponds, streams, waterfalls)
│   └── Vegetation (trees, bushes, grass, flowers)
├── Climate Features
│   ├── Weather Effects (snow, rain, wind patterns)
│   ├── Seasonal Elements (autumn leaves, spring growth)
│   └── Temperature Indicators (ice, drought, humidity)
└── Special Features
    ├── Magical Elements (crystals, energy fields, portals)
    ├── Ancient Ruins (lost architecture, archaeological sites)
    └── Natural Wonders (unique formations, rare phenomena)
```

## Biome Transformation System

### Forest Biome Adaptations
**Environmental Characteristics:**
- Dense vegetation, high humidity, filtered sunlight
- Organic growth patterns, natural weathering
- Earth tones with vibrant green accents

**Asset Transformations:**
- **Stone Walls** → Moss-covered with climbing ivy and small ferns
- **Wooden Houses** → Log construction with living roofs and tree integration
- **Roads** → Dirt paths with exposed roots, fallen logs as bridges
- **Wells** → Stone wells surrounded by mushroom rings and forest flowers
- **Shops** → Tree-house styled with hanging plant displays
- **Farms** → Forest clearings with terraced gardens and herb spirals

### Desert Biome Adaptations
**Environmental Characteristics:**
- Arid climate, intense sunlight, sand and stone
- Wind erosion, heat-adapted architecture
- Warm earth tones, bleached surfaces

**Asset Transformations:**
- **Stone Walls** → Sandstone with wind-carved patterns and sun bleaching
- **Houses** → Adobe construction with flat roofs and shade structures
- **Roads** → Sand-covered stone with camel tracks and wind patterns
- **Wells** → Ornate stone with brass fittings and decorative tilework
- **Shops** → Marketplace tents with colorful awnings and wind chimes
- **Farms** → Oasis agriculture with irrigation channels and date palms

### Jungle Biome Adaptations
**Environmental Characteristics:**
- Extreme humidity, dense canopy, vibrant ecosystem
- Rapid growth, constant decomposition cycle
- Rich greens with exotic color accents

**Asset Transformations:**
- **Stone Walls** → Ancient stone completely overgrown with thick vines
- **Houses** → Stilted structures with thatched roofs and hanging gardens
- **Roads** → Elevated wooden walkways and rope bridges
- **Wells** → Bamboo-reinforced stone with tropical flower arrangements
- **Shops** → Open-air pavilions with palm frond roofing
- **Farms** → Terraced hillside agriculture with tropical crops

### Arctic Biome Adaptations
**Environmental Characteristics:**
- Freezing temperatures, snow/ice coverage, limited vegetation
- Wind-resistant design, insulation focus
- Cool blues and whites with warm interior lighting

**Asset Transformations:**
- **Stone Walls** → Ice-reinforced stone with icicle formations
- **Houses** → Heavy timber with steep roofs and smoking chimneys
- **Roads** → Packed snow paths with ice runners and sled tracks
- **Wells** → Enclosed wellhouses with ice-melting braziers
- **Shops** → Heavily insulated buildings with fur-lined windows
- **Farms** → Greenhouse structures and cold-frame gardens

## Historical Layering System

### Age Categories
**Newly Discovered (0-1 game years):**
- Clean, well-maintained appearance
- Bright colors, sharp edges
- Minimal weathering or wear
- Fresh construction materials

**Established (1-10 game years):**
- Lived-in character and personality
- Natural wear patterns from use
- Small modifications and additions
- Comfortable, functional appearance

**Mature (10-50 game years):**
- Significant weathering and patina
- Multiple renovation layers
- Established character and history
- Integration with natural environment

**Ancient (50+ game years):**
- Extensive weathering and decay
- Overgrowth and natural reclamation
- Archaeological significance
- Mysterious or ruined appearance

### Player Impact Indicators
**High Traffic Areas:**
- Worn pathways and thresholds
- Reinforced high-use surfaces
- Additional lighting and signage
- Infrastructure upgrades

**Battle Sites:**
- Damage marks and repair patches
- Defensive modifications
- Memorial elements
- Scorched or broken areas

**Economic Prosperity:**
- Decorative embellishments
- Quality material upgrades
- Expanded structures
- Artistic flourishes

**Economic Decline:**
- Deferred maintenance
- Simpler repairs
- Reduced ornamentation
- Functional over aesthetic choices

## Technical Implementation

### Generation Workflow
```python
class AssetGenerator:
    def generate_asset(self, request: AssetRequest) -> GeneratedAsset:
        # 1. Analyze context
        context = self.analyze_context(request.location, request.biome)
        
        # 2. Select base asset
        base_asset = self.asset_library.get(request.asset_type)
        
        # 3. Build generation prompt
        prompt = self.build_prompt(base_asset, context, request.modifiers)
        
        # 4. Check cache
        cache_key = self.generate_cache_key(prompt)
        if cached := self.cache.get(cache_key):
            return cached
        
        # 5. Generate with Stable Diffusion
        generated = self.stable_diffusion.generate(prompt, base_asset.reference_image)
        
        # 6. Post-process and validate
        final_asset = self.post_process(generated, base_asset.constraints)
        
        # 7. Cache and return
        self.cache.store(cache_key, final_asset)
        return final_asset
```

### Prompt Engineering Framework
```python
class PromptBuilder:
    def build_contextual_prompt(self, base_asset, biome, age, traffic, special_modifiers):
        prompt_parts = [
            f"{base_asset.description}",
            f"in {biome.name} environment",
            f"{age.descriptor} and {traffic.wear_level}",
            f"{', '.join(special_modifiers)}" if special_modifiers else "",
            "maintaining clear gameplay silhouette and function",
            "isometric game art style, detailed but clean",
            f"negative: {biome.negative_keywords}"
        ]
        return ", ".join(filter(None, prompt_parts))
```

### Caching Strategy
```python
class AssetCache:
    def __init__(self):
        self.memory_cache = {}  # Hot assets
        self.disk_cache = {}    # Frequently used
        self.cdn_cache = {}     # Distributed storage
        
    def get_cache_key(self, prompt, base_asset_hash, style_seed):
        return hashlib.sha256(f"{prompt}:{base_asset_hash}:{style_seed}".encode()).hexdigest()
    
    def store_with_metadata(self, key, asset, metadata):
        self.memory_cache[key] = {
            'asset': asset,
            'generated_at': time.time(),
            'usage_count': 0,
            'biome': metadata.biome,
            'region': metadata.region
        }
```

## Quality Control & Validation

### Automated Validation
- **Silhouette Preservation**: Compare generated asset outline to base asset
- **Color Palette Validation**: Ensure biome-appropriate color schemes
- **Resolution Standards**: Maintain consistent image quality and dimensions
- **Functional Element Detection**: Verify critical gameplay elements remain visible

### Content Filtering
- **Appropriateness Screening**: Family-friendly content validation
- **Brand Consistency**: Maintain artistic style coherence
- **Cultural Sensitivity**: Respectful representation of architectural styles
- **Gameplay Impact**: Ensure no competitive advantages from visual variations

### Performance Optimization
- **Texture Compression**: Optimize generated assets for game engine
- **LOD Generation**: Create multiple detail levels for performance scaling
- **Atlas Packing**: Combine small assets into efficient texture atlases
- **Streaming Preparation**: Format assets for progressive loading

## Monitoring & Analytics

### Generation Metrics
- **Success Rates**: Track generation completion and quality scores
- **Performance Timing**: Monitor generation speed and resource usage
- **Cache Efficiency**: Measure hit rates and storage optimization
- **Player Satisfaction**: Collect feedback on generated content quality

### Usage Analytics
- **Popular Combinations**: Identify frequently requested asset variations
- **Regional Preferences**: Track which biome adaptations are most engaging
- **Performance Impact**: Monitor game performance with generated assets
- **Resource Utilization**: Optimize generation queue and priority systems

## Future Enhancements

### Advanced Generation Features
- **Seasonal Adaptation**: Assets that change with in-game seasons
- **Weather Integration**: Dynamic response to current weather conditions
- **Magic Influence**: Visual effects from nearby magical events or sources
- **Economic Reflection**: Asset quality reflecting regional economic health

### Interactive Elements
- **Player Customization**: Allow players to request specific aesthetic modifications
- **Community Voting**: Let players choose preferred variations for shared areas
- **Historical Preservation**: Document and preserve significant generated assets
- **Cultural Evolution**: Assets that evolve based on dominant player factions

### Technical Improvements
- **Real-time Generation**: Near-instantaneous asset creation for dynamic events
- **3D Model Support**: Extension to volumetric and 3D asset generation
- **Animation Integration**: Generated environmental animations and effects
- **Procedural Materials**: AI-generated surface textures and material properties
- **Character Integration**: Coordination with character creation system for consistent art style

> **📖 Related Systems**: See `docs/character-creation.md` for AI-generated character portraits using similar technology
