# Character Creation System

## Overview
Arcane Realms features an **AI-powered character creation system** that uses Stable Diffusion to generate unique character portraits. This system provides infinite variety while maintaining artistic consistency and ensuring all generated content is appropriate for the game's fantasy setting.

> **TODO:** Explain where generated portraits are stored and how long-term caching or CDN distribution is handled.

## Design Philosophy

### Player Agency with Guidance
- **Effortless Discovery**: Players can quickly find characters they love through randomization
- **Meaningful Choice**: Limited but impactful customization options prevent decision paralysis
- **Artistic Consistency**: All generated characters fit the game's visual style
- **Inclusive Representation**: Diverse character options representing various backgrounds and cultures

### Technical Excellence
- **Performance First**: Fast generation times with intelligent caching
- **Quality Assurance**: Automated content filtering and quality validation
- **Scalability**: System designed to handle high concurrent usage
- **Fallback Safety**: Graceful degradation when AI services are unavailable
> **TODO:** Detail moderation policies and tools used for filtering inappropriate content.

## Character Generation Framework

### Base Parameter Set
```python
class CharacterParameters:
    # Demographic
    heritage: Heritage  # Cultural/ethnic background
    age_category: AgeCategory  # Young adult, adult, mature
    gender_expression: GenderExpression  # Various representation options
    
    # Physical Features
    hair_style: HairStyle
    hair_color: ColorPalette
    eye_color: ColorPalette
    skin_tone: SkinTone
    facial_structure: FacialType
    
    # Styling
    clothing_style: OutfitStyle
    accessories: List[AccessoryType]
    expression: EmotionalExpression
    
    # Technical
    art_seed: int  # For consistency
    style_variant: ArtStyle
    quality_level: QualityTier
```

> **TODO:** Define allowable ranges and validation rules for each parameter.

### Heritage and Cultural Representation
```python
class Heritage(Enum):
    NORTHERN_KINGDOMS = "nordic_inspired"
    DESERT_REALMS = "middle_eastern_inspired"
    ISLAND_NATIONS = "polynesian_inspired"
    FOREST_CLANS = "celtic_inspired"
    MOUNTAIN_FOLK = "alpine_inspired"
    PLAINS_RIDERS = "steppe_inspired"
    COASTAL_CITIES = "mediterranean_inspired"
    MYSTIC_ENCLAVES = "fantasy_original"
```

> **TODO:** Include examples or references for each heritage to guide prompt design.

### Customization Categories

#### Tier 1: Always Customizable
- **Hair Style**: 8-12 options per generation session
- **Hair Color**: Natural and fantasy colors
- **Eye Color**: Wide range including magical variants
- **Clothing Style**: Class-appropriate outfit variations

#### Tier 2: Sometimes Available
- **Facial Accessories**: Scars, tattoos, piercings (when appropriate)
- **Jewelry**: Earrings, necklaces, rings
- **Expression**: Confident, friendly, mysterious, determined
- **Pose Variation**: Slight adjustments to character positioning

#### Tier 3: Locked for Consistency
- **Art Quality**: Maintained at professional standard
- **Proportions**: Consistent with game requirements
- **Age Appropriateness**: All content family-friendly
- **Style Cohesion**: Matches game's artistic direction

## User Interface Design

### Main Creation Screen
```
┌─────────────────────────────────────────────────────────┐
│                    Character Creation                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐    ┌───────────────────────────┐   │
│  │                 │    │  Character Name           │   │
│  │   Generated     │    │  ┌─────────────────────┐  │   │
│  │   Character     │    │  │ [Text Input Field]  │  │   │
│  │   Portrait      │    │  └─────────────────────┘  │   │
│  │   (512x512)     │    │                           │   │
│  │                 │    │  ┌─────────────────────┐  │   │
│  │                 │    │  │  [ Randomize All ]  │  │   │
│  │                 │    │  └─────────────────────┘  │   │
│  │                 │    │                           │   │
│  │                 │    │  ┌─────────────────────┐  │   │
│  │                 │    │  │  [ Customize... ]   │  │   │
│  └─────────────────┘    │  └─────────────────────┘  │   │
│                         │                           │   │
│                         │  ┌─────────────────────┐  │   │
│                         │  │ [ Start Adventure ] │  │   │
│                         │  └─────────────────────┘  │   │
│                         └───────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Customization Panel
```
┌─────────────────────────────────────────────────────────┐
│                  Character Customization               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐  ┌─────────────────────────────────┐   │
│  │  Current    │  │           Options               │   │
│  │  Character  │  │                                 │   │
│  │   Preview   │  │  Hair Style:                    │   │
│  │             │  │  ○ ○ ○ ○ ○ ○ [Randomize Hair]  │   │
│  │             │  │                                 │   │
│  │             │  │  Hair Color:                    │   │
│  │             │  │  ● ● ● ● ● ● [Random Color]     │   │
│  │             │  │                                 │   │
│  │             │  │  Eye Color:                     │   │
│  │             │  │  ◆ ◆ ◆ ◆ ◆ ◆ [Random Eyes]     │   │
│  │             │  │                                 │   │
│  │             │  │  Clothing:                      │   │
│  │             │  │  ⬜⬜⬜⬜ [Random Outfit]        │   │
│  │             │  │                                 │   │
│  │             │  │  ┌───────────┐ ┌─────────────┐  │   │
│  │             │  │  │[Randomize]│ │[  Accept   ]│  │   │
│  │             │  │  │   All     │ │ Character   │  │   │
│  │             │  │  └───────────┘ └─────────────┘  │   │
│  └─────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Technical Implementation

### Generation Pipeline
```python
class CharacterGenerator:
    def __init__(self):
        self.stable_diffusion = StableDiffusionClient()
        self.cache = CharacterCache()
        self.content_filter = ContentFilter()
        
    async def generate_character(self, parameters: CharacterParameters = None) -> Character:
        # 1. Generate or use provided parameters
        if not parameters:
            parameters = self.generate_random_parameters()
        
        # 2. Check cache first
        cache_key = self.generate_cache_key(parameters)
        if cached := await self.cache.get(cache_key):
            return cached
        
        # 3. Build generation prompt
        prompt = self.build_character_prompt(parameters)
        negative_prompt = self.build_negative_prompt()
        
        # 4. Generate image
        image_data = await self.stable_diffusion.generate(
            prompt=prompt,
            negative_prompt=negative_prompt,
            width=512,
            height=512,
            guidance_scale=7.5,
            steps=20,
            seed=parameters.art_seed
        )
        
        # 5. Content validation
        if not self.content_filter.validate(image_data):
            return await self.generate_character()  # Retry with new seed
        
        # 6. Post-processing
        processed_image = self.post_process_image(image_data)
        
        # 7. Create character object
        character = Character(
            portrait=processed_image,
            parameters=parameters,
            generated_at=datetime.now()
        )
        
        # 8. Cache and return
        await self.cache.store(cache_key, character)
        return character
```

### Prompt Engineering

#### Base Prompt Template
```python
def build_character_prompt(self, params: CharacterParameters) -> str:
    prompt_parts = [
        "Portrait of a fantasy game character",
        f"{params.heritage.description} heritage",
        f"{params.age_category.descriptor}",
        f"{params.gender_expression.descriptor}",
        f"with {params.hair_style.description} {params.hair_color.name} hair",
        f"{params.eye_color.name} eyes",
        f"{params.skin_tone.description} skin",
        f"wearing {params.clothing_style.description}",
        f"{params.expression.description} expression",
        "detailed digital art, fantasy game portrait",
        "isometric character art style",
        "clean background, professional quality",
        f"art seed: {params.art_seed}"
    ]
    return ", ".join(prompt_parts)

def build_negative_prompt(self) -> str:
    return (
        "blurry, low quality, distorted, inappropriate, "
        "realistic photo, modern clothing, weapons, "
        "multiple people, full body, landscape, "
        "text, watermark, signature"
    )
```

#### Heritage-Specific Prompts
```python
HERITAGE_PROMPTS = {
    Heritage.NORTHERN_KINGDOMS: "nordic inspired, pale skin, angular features, cold climate clothing",
    Heritage.DESERT_REALMS: "middle eastern inspired, warm tones, ornate jewelry, desert appropriate",
    Heritage.ISLAND_NATIONS: "polynesian inspired, tan skin, flowing clothing, ocean motifs",
    Heritage.FOREST_CLANS: "celtic inspired, earth tones, natural accessories, woodland aesthetic",
    Heritage.MOUNTAIN_FOLK: "alpine inspired, sturdy build, practical clothing, mountain aesthetic",
    Heritage.PLAINS_RIDERS: "steppe inspired, weathered look, travel clothing, nomadic aesthetic",
    Heritage.COASTAL_CITIES: "mediterranean inspired, olive skin, maritime clothing, coastal aesthetic",
    Heritage.MYSTIC_ENCLAVES: "fantasy original, magical features, ethereal appearance, mystical clothing"
}
```

### Performance Optimization

#### Caching Strategy
```python
class CharacterCache:
    def __init__(self):
        self.memory_cache = {}  # Hot cache for active sessions
        self.redis_cache = RedisClient()  # Shared cache across servers
        self.file_cache = FileStorage()  # Long-term storage
        
    async def get(self, cache_key: str) -> Optional[Character]:
        # 1. Check memory first
        if character := self.memory_cache.get(cache_key):
            return character
            
        # 2. Check Redis
        if data := await self.redis_cache.get(cache_key):
            character = Character.from_json(data)
            self.memory_cache[cache_key] = character
            return character
            
        # 3. Check file storage
        if data := await self.file_cache.get(cache_key):
            character = Character.from_json(data)
            await self.redis_cache.set(cache_key, data, ttl=3600)
            self.memory_cache[cache_key] = character
            return character
            
        return None
```

#### Generation Queue Management
```python
class GenerationQueue:
    def __init__(self, max_concurrent=3):
        self.max_concurrent = max_concurrent
        self.active_generations = set()
        self.pending_queue = asyncio.Queue()
        
    async def request_generation(self, parameters: CharacterParameters) -> Character:
        if len(self.active_generations) >= self.max_concurrent:
            await self.pending_queue.put(parameters)
            return await self.wait_for_generation(parameters)
        else:
            return await self.generate_immediately(parameters)
```

### Quality Assurance

#### Content Validation
```python
class ContentFilter:
    def __init__(self):
        self.nsfw_detector = NSFWDetector()
        self.quality_assessor = QualityAssessor()
        self.style_validator = StyleValidator()
        
    def validate(self, image_data: bytes) -> bool:
        # 1. NSFW check
        if self.nsfw_detector.is_inappropriate(image_data):
            return False
            
        # 2. Quality check
        if not self.quality_assessor.meets_standards(image_data):
            return False
            
        # 3. Style consistency check
        if not self.style_validator.matches_game_style(image_data):
            return False
            
        return True
```

#### Fallback Systems
```python
class FallbackManager:
    def __init__(self):
        self.preset_characters = self.load_preset_library()
        
    async def get_fallback_character(self, parameters: CharacterParameters) -> Character:
        # Find closest preset match
        best_match = self.find_closest_preset(parameters)
        return self.customize_preset(best_match, parameters)
        
    def load_preset_library(self) -> List[Character]:
        # Load pre-generated character library
        # Covers common parameter combinations
        # Ensures players always have options
        pass
```

## Testing Requirements
- **Parameter Handling** – validate enums, ranges, and required fields
- **Prompt Assembly** – ensure prompts include all selected parameters
- **Generation Queue** – test concurrent requests and queue limits
- **Caching Layers** – verify file, Redis, and memory caches serve expected data
- **Fallback Logic** – confirm preset characters load when generation fails
- **Route Coverage** – API routes return appropriate errors and success responses

## Integration with Game Systems

### Character Data Storage
```python
class PlayerCharacter:
    character_id: str
    player_id: str
    name: str
    portrait_url: str
    creation_parameters: CharacterParameters
    created_at: datetime
    last_updated: datetime
    
    # Game progression data
    level: int = 1
    experience: int = 0
    class_type: CharacterClass = CharacterClass.MAGE
    
    # Social features
    display_name: str
    visibility: VisibilitySettings = VisibilitySettings.PUBLIC
```

### UI Integration Points
- **Loading Screens**: Character portrait during game loading
- **Social Panels**: Player list with character portraits
- **Chat Interface**: Character portrait next to messages
- **Leaderboards**: Character representation in rankings
- **Guild/Party UI**: Member character portraits

### Future Enhancement Roadmap

#### Phase 1: Core Implementation
- Basic generation with randomization
- Simple customization options
- Caching and performance optimization
- Content filtering and quality assurance

#### Phase 2: Enhanced Features
- More detailed customization options
- Character progression reflection in portraits
- Social sharing and gallery features
- Mobile-optimized character creation

#### Phase 3: Advanced Systems
- Equipment visualization on character portraits
- Character aging and experience reflection
- Community-driven character contests
- AI-powered character name generation

#### Phase 4: Integration Expansion
- Character portraits in world (wanted posters, statues)
- NPC recognition and commentary on character appearance
- Character customization as gameplay reward
- Cross-game character import/export systems
