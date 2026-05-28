"""
Pro Catalog Generation Service
Generates all 7 page types with STRICT garment preservation.

Page Types:
1. front_only - Model front view
2. back_only - Model back view  
3. front_back_collage - Split layout
4. aesthetic_product - Garment only, no model
5. hero_closeup - Print/design detail
6. fabric_closeup - Texture macro
7. mega_collage - 4-in-1 composite

CRITICAL: Garment details (prints, logos, textures) MUST be preserved EXACTLY.
"""

import os
import random
from io import BytesIO
from pathlib import Path
from typing import Optional, Dict, List, Literal, Any
from PIL import Image, ImageDraw, ImageFont
from google import genai
from google.genai import types
import asyncio


# ============================================
# 16 THEMES CONFIGURATION
# ============================================

PRO_THEMES = {
    "clean_white": {
        "name": "Clean White",
        "background": "Pure white (#FFFFFF) seamless studio backdrop, infinite white, no shadows",
        "lighting": "Soft diffused beauty dish lighting, even illumination, no harsh shadows",
        "mood": "Minimal, clean, premium commercial",
        "fonts": ["Montserrat", "Inter"],
        "colors": {"primary": "#FFFFFF", "secondary": "#F5F5F5", "accent": "#333333"}
    },
    "soft_neutral": {
        "name": "Soft Neutral", 
        "background": "Warm cream/beige seamless studio backdrop, soft natural tones",
        "lighting": "Soft warm natural window light feeling, golden undertones",
        "mood": "Warm, inviting, lifestyle catalog",
        "fonts": ["Lora", "Open Sans"],
        "colors": {"primary": "#FAF8F5", "secondary": "#EBE6DE", "accent": "#8B7355"}
    },
    "dark_luxe": {
        "name": "Dark Luxe",
        "background": "Rich black backdrop with subtle gold accents, luxury studio",
        "lighting": "Dramatic rim lighting, gold/warm key light, high contrast",
        "mood": "Premium, luxurious, high-end editorial",
        "fonts": ["Playfair Display", "Inter"],
        "colors": {"primary": "#1A1A1A", "secondary": "#2D2D2D", "accent": "#D4AF37"}
    },
    "summer_vibes": {
        "name": "Summer Vibes",
        "background": "Bright sunny yellow/coral gradient, beach vacation energy",
        "lighting": "Bright warm sunlight, golden hour tones, cheerful",
        "mood": "Fun, energetic, vacation ready",
        "fonts": ["Poppins", "Source Sans Pro"],
        "colors": {"primary": "#FFF9E6", "secondary": "#FFE066", "accent": "#FF6B6B"}
    },
    "winter_frost": {
        "name": "Winter Frost",
        "background": "Cool blue/silver gradient, icy winter atmosphere",
        "lighting": "Cool blue-tinted lighting, crisp clean feel",
        "mood": "Fresh, cool, winter collection",
        "fonts": ["Montserrat", "Roboto"],
        "colors": {"primary": "#F0F8FF", "secondary": "#E6F2FF", "accent": "#4A90D9"}
    },
    "autumn_warm": {
        "name": "Autumn Warm",
        "background": "Burnt orange and maroon tones, fall foliage inspiration",
        "lighting": "Warm golden hour, amber tones, cozy atmosphere",
        "mood": "Cozy, warm, seasonal fall",
        "fonts": ["Lora", "Open Sans"],
        "colors": {"primary": "#FDF5E6", "secondary": "#D2691E", "accent": "#8B0000"}
    },
    "spring_bloom": {
        "name": "Spring Bloom",
        "background": "Pastel pink and green, fresh spring garden vibes",
        "lighting": "Soft natural daylight, fresh and airy",
        "mood": "Fresh, natural, blooming",
        "fonts": ["Poppins", "Inter"],
        "colors": {"primary": "#FFF0F5", "secondary": "#E8F5E9", "accent": "#81C784"}
    },
    "urban_street": {
        "name": "Urban Street",
        "background": "Concrete gray walls, urban textures, graffiti hints",
        "lighting": "Natural street lighting, gritty authentic feel",
        "mood": "Edgy, streetwear, urban cool",
        "fonts": ["Oswald", "Roboto"],
        "colors": {"primary": "#E0E0E0", "secondary": "#9E9E9E", "accent": "#FF5722"}
    },
    "retro_90s": {
        "name": "Retro 90s",
        "background": "Vibrant nostalgic colors, geometric patterns, VHS aesthetic",
        "lighting": "Colorful mixed lighting, vintage film quality",
        "mood": "Nostalgic, fun, throwback vibes",
        "fonts": ["Poppins", "Source Sans Pro"],
        "colors": {"primary": "#FFEB3B", "secondary": "#E91E63", "accent": "#00BCD4"}
    },
    "premium_editorial": {
        "name": "Premium Editorial",
        "background": "Clean studio, high-fashion magazine setup",
        "lighting": "Professional fashion photography lighting, beauty lighting",
        "mood": "High-fashion, editorial, Vogue quality",
        "fonts": ["Playfair Display", "Source Sans Pro"],
        "colors": {"primary": "#FAFAFA", "secondary": "#212121", "accent": "#757575"}
    },
    "playful_kids": {
        "name": "Playful Kids",
        "background": "Bright primary colors, playful patterns, fun energy",
        "lighting": "Bright cheerful lighting, colorful accents",
        "mood": "Fun, playful, kid-friendly",
        "fonts": ["Poppins", "Roboto"],
        "colors": {"primary": "#FFF8E1", "secondary": "#81D4FA", "accent": "#FF7043"}
    },
    "ethnic_festive": {
        "name": "Ethnic Festive",
        "background": "Rich jewel tones, traditional patterns, celebration mood",
        "lighting": "Warm golden lighting, festive glow",
        "mood": "Celebratory, cultural, festive",
        "fonts": ["Lora", "Open Sans"],
        "colors": {"primary": "#FDF5E6", "secondary": "#C62828", "accent": "#FFD700"}
    },
    "neon_night": {
        "name": "Neon Night",
        "background": "Dark city night with neon pink/blue glow, cyberpunk vibes",
        "lighting": "Neon colored rim lights, dramatic night photography",
        "mood": "Edgy, night life, modern urban",
        "fonts": ["Oswald", "Inter"],
        "colors": {"primary": "#0D0D0D", "secondary": "#1A1A2E", "accent": "#FF00FF"}
    },
    "bohemian": {
        "name": "Bohemian",
        "background": "Earth tones, natural textures, boho patterns",
        "lighting": "Soft natural light, organic feel",
        "mood": "Free-spirited, natural, earthy",
        "fonts": ["Lora", "Open Sans"],
        "colors": {"primary": "#F5EBE0", "secondary": "#A98467", "accent": "#6B4423"}
    },
    "varsity_sports": {
        "name": "Varsity Sports",
        "background": "Athletic facility, locker room, sports setting",
        "lighting": "Dynamic sports lighting, action photography style",
        "mood": "Athletic, energetic, sporty",
        "fonts": ["Oswald", "Roboto"],
        "colors": {"primary": "#FFFFFF", "secondary": "#1565C0", "accent": "#F44336"}
    },
    "maximalist_glam": {
        "name": "Maximalist Glam",
        "background": "Baroque richness, gold/purple, over-the-top luxury",
        "lighting": "Dramatic theatrical lighting with sparkle",
        "mood": "Extra, glamorous, bold statement",
        "fonts": ["Playfair Display", "Inter"],
        "colors": {"primary": "#1A1A1A", "secondary": "#8E24AA", "accent": "#FFD700"}
    }
}


# ============================================
# 16 SETTINGS (ENVIRONMENTS)
# ============================================

PRO_SETTINGS = {
    "white_studio": {
        "name": "White Studio",
        "prompt": "Clean infinite white seamless paper backdrop studio, professional soft diffused lighting, no shadows, commercial fashion photography, pure white background extending infinitely",
        "lighting": "Professional beauty dish key light, soft fill, no harsh shadows"
    },
    "gray_concrete": {
        "name": "Gray Concrete Studio",
        "prompt": "Industrial concrete studio with gray textured walls and polished concrete floor, modern minimalist architectural setting, soft window light from above",
        "lighting": "Natural soft window light, industrial atmosphere"
    },
    "colored_gel": {
        "name": "Colored Gel Studio",
        "prompt": "Professional studio with colored lighting gels creating dramatic colored shadows and rim lights, creative fashion editorial setup on neutral background",
        "lighting": "Colored gel lights for creative rim lighting and shadows"
    },
    "beach_golden": {
        "name": "Beach Golden Hour",
        "prompt": "Sandy tropical beach at golden hour sunset, warm glowing light, gentle ocean waves visible in soft focus background, palm tree shadows, vacation paradise",
        "lighting": "Warm golden hour sunlight, natural rim lighting from behind"
    },
    "mountain_trail": {
        "name": "Mountain Trail",
        "prompt": "Rocky mountain hiking trail surrounded by pine trees, morning mist in valleys, crisp mountain air atmosphere, adventure outdoor setting with dramatic peaks in background",
        "lighting": "Early morning mountain light, crisp and clear"
    },
    "city_rooftop": {
        "name": "City Rooftop",
        "prompt": "Modern urban rooftop at twilight/dusk, city skyline with twinkling lights in background, string lights decoration, metropolitan vibes, sunset sky gradient",
        "lighting": "Twilight blue hour, warm accent lights from city"
    },
    "graffiti_alley": {
        "name": "Graffiti Alley",
        "prompt": "Urban brick alley wall covered in vibrant colorful graffiti art and street murals, authentic street photography location, raw urban texture",
        "lighting": "Natural diffused daylight in urban setting"
    },
    "cafe_terrace": {
        "name": "Cafe Terrace",
        "prompt": "European-style outdoor cafe terrace with potted plants and flowers, rustic wooden bistro furniture, charming sidewalk cafe atmosphere, natural daylight",
        "lighting": "Soft natural daylight, warm cafe ambiance"
    },
    "park_bench": {
        "name": "Park Bench",
        "prompt": "Beautiful public park with large trees, wooden bench, dappled sunlight filtering through green foliage, natural relaxed urban park atmosphere",
        "lighting": "Dappled natural sunlight through leaves"
    },
    "college_campus": {
        "name": "College Campus",
        "prompt": "University campus with classic brick architecture, ivy-covered walls, library interior or collegiate corridor, studious academic atmosphere",
        "lighting": "Natural daylight, scholarly ambiance"
    },
    "gym_sports": {
        "name": "Gym / Sports Facility",
        "prompt": "Modern gym interior with exercise equipment, or outdoor basketball court with urban backdrop, athletic training environment, energetic sports facility",
        "lighting": "Bright gym lighting, athletic energy"
    },
    "living_room": {
        "name": "Living Room Home",
        "prompt": "Cozy modern home interior with neutral furniture (beige sofa, wood accents), large windows with soft natural light, comfortable lifestyle setting",
        "lighting": "Soft window light, cozy home atmosphere"
    },
    "luxury_hotel": {
        "name": "Luxury Hotel Lobby",
        "prompt": "Five-star luxury hotel lobby with marble floors, elegant chandeliers, gold accents, premium high-end interior design, sophisticated ambiance",
        "lighting": "Elegant warm chandelier lighting, luxury feel"
    },
    "art_gallery": {
        "name": "Art Gallery",
        "prompt": "Modern art gallery with clean white walls, contemporary art pieces visible, sophisticated cultural setting, museum-like track lighting",
        "lighting": "Professional gallery track lighting, clean white"
    },
    "night_market": {
        "name": "Night Market / Festival",
        "prompt": "Vibrant night market or street festival setting with colorful string lights, food stalls in background blur, lively crowd atmosphere, festive evening energy",
        "lighting": "Warm string lights, colorful festival glow"
    },
    "garden_greenhouse": {
        "name": "Garden / Greenhouse",
        "prompt": "Lush botanical garden or glass greenhouse interior, tropical plants everywhere, natural green foliage, organic garden setting with filtered sunlight",
        "lighting": "Filtered natural light through glass/leaves"
    }
}


# ============================================
# POSES WITH PROPS
# ============================================

PRO_POSES = {
    # Basic standing
    "catalog_standard": {
        "name": "Standing Standard",
        "prompt": "Classic catalog pose standing straight, hands relaxed at sides, feet shoulder-width apart, confident shoulders-back stance, direct eye contact",
        "prop": None
    },
    "hands_on_hips": {
        "name": "Hands on Hips",
        "prompt": "Power pose with hands firmly on hips, elbows out, weight on one leg, confident assertive expression",
        "prop": None
    },
    "hands_in_pockets": {
        "name": "Hands in Pockets",
        "prompt": "Relaxed stance with hands casually in pockets, weight shifted to one leg, cool casual demeanor",
        "prop": None
    },
    "arms_crossed": {
        "name": "Arms Crossed",
        "prompt": "Arms crossed casually across chest, relaxed confident stance, slight head tilt, approachable expression",
        "prop": None
    },
    "leaning_wall": {
        "name": "Leaning on Wall",
        "prompt": "Leaning casually against wall with one shoulder, one foot flat against wall, arms crossed or in pockets, cool relaxed vibe",
        "prop": None
    },
    # Walking
    "walking_towards": {
        "name": "Walking Towards",
        "prompt": "Mid-stride walking towards camera with purpose, confident stride, natural arm swing, direct eye contact",
        "prop": None
    },
    "walking_away": {
        "name": "Walking Away",
        "prompt": "Walking away from camera showing back, natural gait captured mid-step, looking slightly over shoulder",
        "prop": None
    },
    "mid_step": {
        "name": "Mid-Step Candid",
        "prompt": "Candid mid-step movement captured naturally, authentic street photography moment",
        "prop": None
    },
    # Sitting
    "sitting_chair": {
        "name": "Sitting on Chair",
        "prompt": "Sitting casually on a sleek modern designer chair, legs crossed elegantly, relaxed confident model pose",
        "prop": "modern chair"
    },
    "sitting_floor": {
        "name": "Sitting on Floor",
        "prompt": "Sitting cross-legged on the floor in relaxed urban street style pose, hands on knees",
        "prop": None
    },
    "sitting_steps": {
        "name": "Sitting on Steps",
        "prompt": "Sitting casually on outdoor steps or stairs, one leg extended, casual urban vibe",
        "prop": "steps"
    },
    # Active poses with props
    "playing_guitar": {
        "name": "Playing Guitar",
        "prompt": "Standing or sitting playing acoustic guitar, fingers on frets, musical artistic vibe, creative expression",
        "prop": "acoustic guitar"
    },
    "headphones": {
        "name": "Listening to Music",
        "prompt": "Wearing over-ear headphones, eyes closed or looking at camera with slight smile, enjoying music vibe",
        "prop": "over-ear headphones"
    },
    "jumping": {
        "name": "Jumping",
        "prompt": "Captured mid-air jump, legs bent, arms dynamic, joyful energetic expression, athletic movement",
        "prop": None
    },
    "basketball": {
        "name": "Playing Basketball",
        "prompt": "Holding basketball casually on shoulder or tucked under arm, confident sporty athletic stance",
        "prop": "basketball"
    },
    "skateboard": {
        "name": "Skateboard Stance", 
        "prompt": "Standing with one foot on skateboard, or holding skateboard under arm, street style cool skater vibe",
        "prop": "skateboard"
    },
    "dancing": {
        "name": "Dancing",
        "prompt": "Mid-dance movement pose, dynamic body position, expressive and fluid, joyful energy",
        "prop": None
    },
    "reading": {
        "name": "Reading",
        "prompt": "Casually reading a book or magazine, thoughtful intellectual expression, natural relaxed pose",
        "prop": "book or magazine"
    },
    "selfie": {
        "name": "Taking Selfie",
        "prompt": "Holding phone up taking a selfie, natural social media moment, authentic candid feel",
        "prop": "smartphone"
    },
    "backpack": {
        "name": "With Backpack",
        "prompt": "Wearing trendy backpack on one or both shoulders, urban explorer street style, adventure ready",
        "prop": "backpack"
    },
    "coffee": {
        "name": "Holding Coffee",
        "prompt": "Holding takeaway coffee cup casually, urban lifestyle morning vibe, relaxed café culture",
        "prop": "coffee cup"
    }
}


# ============================================
# MODEL APPEARANCE (NATURAL & DIVERSE)
# ============================================

def get_random_male_appearance() -> Dict[str, str]:
    """Generate natural, diverse male model appearance"""
    hairstyles = [
        "messy textured hair", "buzz cut", "wavy natural hair", "modern mullet",
        "man bun", "short cropped hair", "natural curly hair", "fade haircut",
        "bald/shaved head", "beanie covering hair", "cap worn backwards"
    ]
    skin_variations = [
        "with natural acne marks", "with light stubble beard",
        "with freckles", "with clear skin", "with light facial hair",
        "with 5 o'clock shadow", "with full beard"
    ]
    builds = ["slim athletic", "lean", "average athletic", "slightly muscular"]
    accessories = [
        "", "wearing simple chain necklace", "wearing glasses",
        "visible tattoo on arm", "ear piercing", ""
    ]
    
    return {
        "hair": random.choice(hairstyles),
        "skin_note": random.choice(skin_variations),
        "build": random.choice(builds),
        "accessory": random.choice(accessories)
    }


def get_random_female_appearance() -> Dict[str, str]:
    """Generate natural, diverse female model appearance"""
    hairstyles = [
        "natural wavy hair", "straight long hair", "curly textured hair",
        "braided hair", "short bob", "ponytail", "natural afro texture",
        "hair with highlights", "hair in loose bun"
    ]
    skin_variations = [
        "with natural freckles", "with beauty marks", "with clear skin",
        "with light freckles", "natural skin texture"
    ]
    builds = ["slim", "athletic", "curvy", "petite", "average"]
    accessories = [
        "", "minimal stud earrings", "small nose ring", "wearing glasses",
        "simple bracelet", ""
    ]
    
    return {
        "hair": random.choice(hairstyles),
        "skin_note": random.choice(skin_variations),
        "build": random.choice(builds),
        "accessory": random.choice(accessories)
    }


# ============================================
# SKIN TONES (RANDOMIZED FROM USER SPEC)
# ============================================

SKIN_TONES = {
    "fair": "fair North Indian skin tone, light porcelain complexion, glowing healthy skin",
    "medium": "medium wheatish Indian skin tone, warm golden-olive undertones, natural glow",
    "wheatish": "warm wheatish complexion, typical Indian skin tone, healthy even skin"
}


def get_random_skin_tone() -> str:
    """Get random skin tone from Fair, Medium, Wheatish"""
    return random.choice(["fair", "medium", "wheatish"])


# ============================================
# STRICT GARMENT PRESERVATION RULES
# ============================================

GARMENT_PRESERVATION_BLOCK = """
╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║  ⛔⛔⛔ ABSOLUTE CRITICAL - GARMENT MUST BE 100% IDENTICAL - ZERO DEVIATION ALLOWED ⛔⛔⛔                ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════╝

STUDY THE REFERENCE GARMENT IMAGE WITH EXTREME ATTENTION TO EVERY DETAIL.

This garment is a REAL COMMERCIAL PRODUCT. The customer will compare your output pixel-by-pixel.
ANY deviation, change, or modification makes the output WORTHLESS and UNUSABLE.

🚫🚫🚫 ABSOLUTELY FORBIDDEN - NEVER DO THESE 🚫🚫🚫
╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║ • DO NOT change, modify, simplify, or reinterpret ANY print/graphic on the garment                      ║
║ • DO NOT alter ANY logo, emblem, brand mark, or icon - reproduce EXACTLY pixel-for-pixel               ║
║ • DO NOT change ANY text, letters, numbers, or typography on the garment                                ║
║ • DO NOT move the position of ANY design element - if logo is on left chest, it stays on LEFT CHEST    ║
║ • DO NOT resize ANY design element - if print is 8cm, it stays 8cm, not bigger or smaller              ║
║ • DO NOT change ANY color - exact RGB values must match (gray stays gray, NOT blue/purple)             ║
║ • DO NOT change the fabric texture - cotton stays cotton, ribbed stays ribbed                          ║
║ • DO NOT add ANY element not in the reference (no extra stripes, no new text)                          ║
║ • DO NOT remove ANY element that IS in the reference                                                     ║
║ • DO NOT "improve", "enhance", "modernize" or "simplify" any design - reproduce EXACTLY AS IS          ║
║ • If garment is PLAIN/SOLID → output MUST be PLAIN/SOLID (no invented graphics)                         ║
║ • If garment has stripes → SAME stripes (count, colors, widths)                                         ║
║ • If garment has a collar pattern → SAME collar pattern                                                  ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════╝

✅✅✅ YOU MUST DO THESE ✅✅✅
╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║ • COPY every design element EXACTLY as shown in reference image                                          ║
║ • PRESERVE exact colors - match the exact hue, saturation, brightness                                    ║
║ • MAINTAIN exact position of all graphics/text relative to garment seams                                 ║
║ • KEEP exact proportions and scale of all design elements                                                ║
║ • PRESERVE fabric texture and material appearance                                                         ║
║ • The output garment must be INDISTINGUISHABLE from the input garment                                    ║
╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════╝

⚠️ FINAL VALIDATION: Before generating, mentally verify:
1. Every print/graphic matches reference EXACTLY
2. All colors match reference EXACTLY  
3. All positions match reference EXACTLY
4. Fabric texture matches reference EXACTLY
5. If plain garment → no added graphics
"""


# ============================================
# CATEGORY CONFIG
# ============================================

CATEGORY_CONFIG = {
    "men": {"desc": "adult Indian male", "age": "25-35 years old"},
    "women": {"desc": "adult Indian female", "age": "25-35 years old"},
    "teen_boy": {"desc": "Indian teenage boy", "age": "14-18 years old"},
    "teen_girl": {"desc": "Indian teenage girl", "age": "14-18 years old"},
    "boy": {"desc": "young Indian boy", "age": "7-12 years old"},
    "girl": {"desc": "young Indian girl", "age": "7-12 years old"},
    "infant_boy": {"desc": "young Indian toddler boy", "age": "2-5 years old"},
    "infant_girl": {"desc": "young Indian toddler girl", "age": "2-5 years old"}
}


class ProGenerationService:
    """
    Professional catalog generation service.
    Generates all 7 page types with strict garment preservation.
    """
    
    PRIMARY_MODEL = "gemini-3-pro-image-preview"
    FALLBACK_MODEL = "gemini-2.5-flash-image"
    API_TIMEOUT = 180  # 3 minutes per generation
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY required")
        self.client = genai.Client(api_key=self.api_key)
    
    def _image_to_pil(self, image_bytes: bytes) -> Image.Image:
        """Convert bytes to PIL Image"""
        from io import BytesIO
        img = Image.open(BytesIO(image_bytes))
        if img.mode not in ('RGB', 'L'):
            img = img.convert('RGB')
        return img
    
    def _pil_to_bytes(self, img: Image.Image) -> bytes:
        """Convert PIL Image to PNG bytes"""
        buffer = BytesIO()
        img.save(buffer, format="PNG", optimize=False)
        buffer.seek(0)
        return buffer.getvalue()
    
    async def _generate_with_timeout(self, model: str, contents: list, config) -> Any:
        """Generate with timeout wrapper"""
        try:
            return await asyncio.wait_for(
                asyncio.to_thread(
                    self.client.models.generate_content,
                    model=model,
                    contents=contents,
                    config=config
                ),
                timeout=self.API_TIMEOUT
            )
        except asyncio.TimeoutError:
            raise TimeoutError(f"Generation timed out after {self.API_TIMEOUT}s")
    
    def _extract_image(self, response) -> bytes:
        """Extract image from Gemini response"""
        import base64
        
        parts = None
        if hasattr(response, 'parts'):
            parts = response.parts
        elif hasattr(response, 'candidates') and response.candidates:
            if response.candidates[0].content:
                parts = response.candidates[0].content.parts
        
        if not parts:
            raise ValueError("No parts in response")
        
        for part in parts:
            if hasattr(part, 'inline_data') and part.inline_data:
                data = part.inline_data.data
                if isinstance(data, str):
                    data = base64.b64decode(data)
                # Validate it's an image
                img = Image.open(BytesIO(data))
                buffer = BytesIO()
                img.save(buffer, format="PNG")
                buffer.seek(0)
                return buffer.getvalue()
        
        raise ValueError("No image found in response")
    
    async def _generate_image(
        self,
        prompt: str,
        garment_image: bytes,
        aspect_ratio: str = "3:4",
        quality: str = "2K"
    ) -> bytes:
        """Core generation method with fallback"""
        garment_pil = self._image_to_pil(garment_image)
        
        for attempt, model in enumerate([self.PRIMARY_MODEL, self.FALLBACK_MODEL]):
            try:
                print(f"  → Generating with {model} (attempt {attempt + 1})")
                
                response = await self._generate_with_timeout(
                    model=model,
                    contents=[prompt, garment_pil],
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE"],
                        image_config=types.ImageConfig(
                            aspect_ratio=aspect_ratio,
                            image_size=quality if model == self.PRIMARY_MODEL else None
                        )
                    )
                )
                
                return self._extract_image(response)
                
            except Exception as e:
                print(f"  ✗ {model} failed: {e}")
                if attempt == 1:
                    raise
        
        raise ValueError("All models failed")
    
    def _apply_editorial_guidelines(self, base_prompt: str, theme: dict) -> str:
        """Wrap prompt with Editorial Art Direction rules"""
        return f"""{base_prompt}

═══════════════════════════════════════════════════════════════════════════════
🎨 ART DIRECTION: HIGH-FASHION EDITORIAL LAYOUT (AI-NATIVE)
═══════════════════════════════════════════════════════════════════════════════
TRANSFORM THIS PHOTO INTO A FINISHED MAGAZINE POSTER / EDITORIAL SPREAD.

1. LAYOUT & COMPOSITION:
- Use ample NEGATIVE SPACE (sky, pure background, wall) for text placement.
- Minimalist, sophisticated composition.
- The image must look like a scanned page from Vogue or Harper's Bazaar.

2. TYPOGRAPHY & TEXT (CRITICAL):
- INVENT A HEADLINE: Create a short, evocative 2-3 word headline matching the '{theme['name']}' mood (e.g. "PURE FORM", "URBAN SOUL", "SUMMER MIST").
- FONT STYLE: Use elegant, thin, high-fashion fonts (Serif or Modern Sans).
- PLACEMENT: Integrate text seamlessly into the void space.
- DO NOT cover the garment.
- Text accuracy: ~95% is acceptable, prioritize aesthetics.

OUTPUT: A complete editorial poster with model and integrated typography.
"""

    # ============================================
    # PAGE TYPE 1: FRONT ONLY
    # ============================================
    
    async def generate_front_only(
        self,
        garment_front: bytes,
        category: str,
        theme_id: str,
        setting_id: str,
        pose_id: str,
        age_range: List[int],
        keywords: str = "",
        quality: str = "2K",
        editorial_mode: bool = False
    ) -> bytes:
        """Generate model wearing garment - FRONT view"""
        
        cat_config = CATEGORY_CONFIG.get(category, CATEGORY_CONFIG["men"])
        theme = PRO_THEMES.get(theme_id, PRO_THEMES["clean_white"])
        setting = PRO_SETTINGS.get(setting_id, PRO_SETTINGS["white_studio"])
        pose = PRO_POSES.get(pose_id, PRO_POSES["catalog_standard"])
        
        # Natural appearance
        if "female" in cat_config["desc"] or "girl" in cat_config["desc"]:
            appearance = get_random_female_appearance()
        else:
            appearance = get_random_male_appearance()
        
        skin_tone = get_random_skin_tone()
        skin_desc = SKIN_TONES[skin_tone]
        
        prompt = f"""{GARMENT_PRESERVATION_BLOCK}

═══════════════════════════════════════════════════════════════════════════════
GENERATE: Professional catalog photo - FRONT VIEW
═══════════════════════════════════════════════════════════════════════════════

THE MODEL:
- Subject: {cat_config['desc']}, {age_range[0]}-{age_range[1]} years old
- Skin: {skin_desc}
- Hair: {appearance['hair']}
- Build: {appearance['build']}
- Details: {appearance['skin_note']} {appearance.get('accessory', '')}
- Expression: Natural, confident, approachable

POSE & CAMERA:
- View: FRONT view (facing camera directly)
- Pose: {pose['prompt']}
- Framing: Full body, head to feet visible
{f"- Prop: {pose['prop']} visible in scene" if pose.get('prop') else ""}

ENVIRONMENT:
- Setting: {setting['prompt']}
- Lighting: {setting['lighting']}
- Theme mood: {theme['mood']}

PHOTOGRAPHY STYLE:
- Quality: Ultra-sharp professional fashion photography
- Style: Premium catalog (Zara, H&M, Uniqlo quality)
- Camera: Shot on Sony A7R IV, 85mm f/1.8

{f"MARKETING KEYWORDS TO EMBODY: {keywords}" if keywords else ""}

OUTPUT: Single photorealistic image, model wearing the EXACT garment from reference.
"""
        
        
        if editorial_mode:
            prompt = self._apply_editorial_guidelines(prompt, theme)
            
        return await self._generate_image(prompt, garment_front, "3:4", quality)
    
    # ============================================
    # PAGE TYPE 2: BACK ONLY
    # ============================================
    
    async def generate_back_only(
        self,
        garment_back: bytes,
        garment_front: bytes,  # For reference consistency
        category: str,
        theme_id: str,
        setting_id: str,
        pose_id: str,
        age_range: List[int],
        keywords: str = "",
        quality: str = "2K",
        editorial_mode: bool = False
    ) -> bytes:
        """Generate model wearing garment - BACK view"""
        
        cat_config = CATEGORY_CONFIG.get(category, CATEGORY_CONFIG["men"])
        theme = PRO_THEMES.get(theme_id, PRO_THEMES["clean_white"])
        setting = PRO_SETTINGS.get(setting_id, PRO_SETTINGS["white_studio"])
        
        if "female" in cat_config["desc"] or "girl" in cat_config["desc"]:
            appearance = get_random_female_appearance()
        else:
            appearance = get_random_male_appearance()
        
        skin_tone = get_random_skin_tone()
        skin_desc = SKIN_TONES[skin_tone]
        
        # Use back image if available, otherwise front
        reference_image = garment_back if garment_back else garment_front
        
        prompt = f"""{GARMENT_PRESERVATION_BLOCK}

═══════════════════════════════════════════════════════════════════════════════
GENERATE: Professional catalog photo - BACK VIEW
═══════════════════════════════════════════════════════════════════════════════

THE MODEL:
- Subject: {cat_config['desc']}, {age_range[0]}-{age_range[1]} years old
- Skin: {skin_desc}
- Hair: {appearance['hair']}
- Build: {appearance['build']}
- Details: {appearance['skin_note']}
- Expression: Looking slightly over shoulder or facing away

POSE & CAMERA:
- View: BACK view (model's back facing camera)
- Pose: Standing naturally, slight looking over shoulder, showing back of garment
- Framing: Full body, head to feet visible
- Focus: Clear view of the back design of the garment

ENVIRONMENT:
- Setting: {setting['prompt']}
- Lighting: {setting['lighting']}
- Theme mood: {theme['mood']}

PHOTOGRAPHY STYLE:
- Quality: Ultra-sharp professional fashion photography
- Style: Premium catalog back view shot
- Camera: Shot on Sony A7R IV, 85mm f/1.8

OUTPUT: Single photorealistic image, model showing BACK of the EXACT garment.
"""
        
        
        if editorial_mode:
            prompt = self._apply_editorial_guidelines(prompt, theme)

        return await self._generate_image(prompt, reference_image, "3:4", quality)
    
    # ============================================
    # PAGE TYPE 3: FRONT + BACK COLLAGE
    # ============================================
    
    async def generate_front_back_collage(
        self,
        garment_front: bytes,
        garment_back: bytes,
        category: str,
        theme_id: str,
        setting_id: str,
        front_pose_id: str,
        back_pose_id: str,
        age_range: List[int],

        keywords: str = "",
        quality: str = "2K",
        editorial_mode: bool = False
    ) -> bytes:
        """Generate collage with front and back views side by side"""
        
        cat_config = CATEGORY_CONFIG.get(category, CATEGORY_CONFIG["men"])
        theme = PRO_THEMES.get(theme_id, PRO_THEMES["clean_white"])
        setting = PRO_SETTINGS.get(setting_id, PRO_SETTINGS["white_studio"])
        front_pose = PRO_POSES.get(front_pose_id, PRO_POSES["catalog_standard"])
        back_pose = PRO_POSES.get(back_pose_id, PRO_POSES["catalog_standard"])
        
        if "female" in cat_config["desc"] or "girl" in cat_config["desc"]:
            appearance = get_random_female_appearance()
        else:
            appearance = get_random_male_appearance()
        
        skin_tone = get_random_skin_tone()
        skin_desc = SKIN_TONES[skin_tone]
        
        # Generate front and back separately, then stitch
        # Note: Collages are stitched, so individual images shouldn't have text unless requested.
        # But if editorial_mode is on, maybe we want the final result to be editorial?
        # Creating a collage of 2 text-heavy posters might be chaotic.
        # Decision: Disable editorial mode for components of a collage to keep it clean.
        
        front_bytes = await self.generate_front_only(
            garment_front, category, theme_id, setting_id, 
            front_pose_id, age_range, keywords, quality,
            editorial_mode=False
        )
        
        back_bytes = await self.generate_back_only(
            garment_back, garment_front, category, theme_id, setting_id,
            back_pose_id, age_range, keywords, quality,
            editorial_mode=False
        )
        
        # Create collage
        front_img = Image.open(BytesIO(front_bytes))
        back_img = Image.open(BytesIO(back_bytes))
        
        # Resize to same height
        target_height = max(front_img.height, back_img.height)
        front_img = front_img.resize(
            (int(front_img.width * target_height / front_img.height), target_height),
            Image.Resampling.LANCZOS
        )
        back_img = back_img.resize(
            (int(back_img.width * target_height / back_img.height), target_height),
            Image.Resampling.LANCZOS
        )
        
        # Create side-by-side collage
        gap = 40
        collage_width = front_img.width + back_img.width + gap
        collage = Image.new('RGB', (collage_width, target_height), color='#FFFFFF')
        collage.paste(front_img, (0, 0))
        collage.paste(back_img, (front_img.width + gap, 0))
        
        return self._pil_to_bytes(collage)
    
    # ============================================
    # PAGE TYPE 4: AESTHETIC PRODUCT SHOT
    # ============================================
    
    async def generate_aesthetic_product(
        self,
        garment_front: bytes,
        theme_id: str,
        keywords: str = "",

        quality: str = "2K",
        editorial_mode: bool = False
    ) -> bytes:
        """Generate styled product shot - garment only, no model"""
        
        theme = PRO_THEMES.get(theme_id, PRO_THEMES["clean_white"])
        
        prompt = f"""{GARMENT_PRESERVATION_BLOCK}

═══════════════════════════════════════════════════════════════════════════════
GENERATE: Aesthetic Product Shot - GARMENT ONLY (NO MODEL)
═══════════════════════════════════════════════════════════════════════════════

PRODUCT STYLING:
- The garment should be displayed beautifully WITHOUT a model
- Style options (choose one that fits best):
  • Elegant flat lay on textured surface
  • Artfully draped/floating in space
  • Hanging on premium wooden hanger
  • Folded neatly with soft shadows
  
COMPOSITION:
- Garment as hero element, centered
- Artistic negative space around
- Premium product photography style
- Could include subtle props (plant leaf, coffee cup edge, magazine)

ENVIRONMENT:
- Background: {theme['background']}
- Lighting: {theme['lighting']}  
- Mood: {theme['mood']}

PHOTOGRAPHY:
- Style: E-commerce premium (Zara, COS quality)
- Sharp focus on fabric texture and details
- Beautiful fabric drape and folds

{f"KEYWORDS: {keywords}" if keywords else ""}

OUTPUT: Beautiful product-only shot of the EXACT garment, no model.
"""
        
        if editorial_mode:
            prompt = self._apply_editorial_guidelines(prompt, theme)
            
        return await self._generate_image(prompt, garment_front, "1:1", quality)
    
    # ============================================
    # PAGE TYPE 5: HERO / PRINT CLOSE-UP
    # ============================================
    
    async def generate_hero_closeup(
        self,
        garment_front: bytes,
        theme_id: str,
        quality: str = "2K",
        editorial_mode: bool = False
    ) -> bytes:
        """Generate close-up shot focusing on print/design detail"""
        
        theme = PRO_THEMES.get(theme_id, PRO_THEMES["clean_white"])
        
        prompt = f"""{GARMENT_PRESERVATION_BLOCK}

═══════════════════════════════════════════════════════════════════════════════
GENERATE: Hero Close-up - PRINT/DESIGN DETAIL SHOT
═══════════════════════════════════════════════════════════════════════════════

FOCUS:
- ZOOM IN on the main design element of the garment
- If there's a chest print/graphic → focus on that
- If there's a logo → focus on that
- If plain → focus on interesting construction (collar, buttons, stitching)

COMPOSITION:
- Tight crop showing the design detail large
- Fill most of the frame with the garment section
- Artistic angle (slight tilt, macro feel)
- Sharp focus on texture and print details

LIGHTING:
- {theme['lighting']}
- Highlighting fabric texture
- Showing material quality

STYLE:
- Editorial detail shot
- Premium craft/quality focus
- Lookbook insert style

OUTPUT: Close-up detail shot showing the print/design/logo EXACTLY as in reference.
The detail MUST be an exact reproduction, not reinterpreted.
"""
        
        if editorial_mode:
            prompt = self._apply_editorial_guidelines(prompt, theme)
            
        return await self._generate_image(prompt, garment_front, "1:1", quality)
    
    # ============================================
    # PAGE TYPE 6: FABRIC CLOSE-UP
    # ============================================
    
    async def generate_fabric_closeup(
        self,
        garment_front: bytes,
        theme_id: str,
        quality: str = "2K"
    ) -> bytes:
        """Generate extreme macro shot of fabric texture"""
        
        prompt = f"""{GARMENT_PRESERVATION_BLOCK}

═══════════════════════════════════════════════════════════════════════════════
GENERATE: Fabric Close-up - EXTREME TEXTURE MACRO
═══════════════════════════════════════════════════════════════════════════════

FOCUS:
- EXTREME close-up of the fabric texture itself
- Show individual thread weave pattern
- Capture material quality (cotton, jersey, linen feel)
- Macro photography style

COMPOSITION:
- Fill entire frame with fabric texture
- Show weave pattern and fiber detail
- Natural fabric folds add dimension
- Soft shadows showing depth

LIGHTING:
- Soft raking light to show texture
- Side lighting to emphasize weave
- Beautiful material quality highlight

STYLE:
- Macro textile photography
- Premium quality showcase
- Material focus

OUTPUT: Extreme close-up of fabric texture. The color and material MUST match reference exactly.
"""
        
        return await self._generate_image(prompt, garment_front, "1:1", quality)
    
    # ============================================
    # PAGE TYPE 7: MEGA COLLAGE (4-in-1)
    # ============================================
    
    async def generate_mega_collage(
        self,
        garment_front: bytes,
        garment_back: bytes,
        category: str,
        theme_id: str,
        setting_id: str,
        front_pose_id: str,
        back_pose_id: str,
        age_range: List[int],
        keywords: str = "",
        quality: str = "2K",
        editorial_mode: bool = False
    ) -> bytes:
        """Generate 4-panel mega collage: front model + back model + product + close-up"""
        
        # Generate all 4 components - DISABLE editorial mode for components
        front_model = await self.generate_front_only(
            garment_front, category, theme_id, setting_id,
            front_pose_id, age_range, keywords, quality,
            editorial_mode=False
        )
        
        back_model = await self.generate_back_only(
            garment_back, garment_front, category, theme_id, setting_id,
            back_pose_id, age_range, keywords, quality,
            editorial_mode=False
        )
        
        product_shot = await self.generate_aesthetic_product(
            garment_front, theme_id, keywords, quality,
            editorial_mode=False
        )
        
        closeup = await self.generate_hero_closeup(
            garment_front, theme_id, quality,
            editorial_mode=False
        )
        
        # Create 2x2 grid collage
        imgs = [
            Image.open(BytesIO(front_model)),
            Image.open(BytesIO(back_model)),
            Image.open(BytesIO(product_shot)),
            Image.open(BytesIO(closeup))
        ]
        
        # Standardize sizes
        cell_width = 800
        cell_height = 1000
        gap = 20
        
        for i, img in enumerate(imgs):
            imgs[i] = img.resize((cell_width, cell_height), Image.Resampling.LANCZOS)
        
        # Create 2x2 grid
        collage_width = cell_width * 2 + gap
        collage_height = cell_height * 2 + gap
        collage = Image.new('RGB', (collage_width, collage_height), color='#FFFFFF')
        
        collage.paste(imgs[0], (0, 0))
        collage.paste(imgs[1], (cell_width + gap, 0))
        collage.paste(imgs[2], (0, cell_height + gap))
        collage.paste(imgs[3], (cell_width + gap, cell_height + gap))
        
        return self._pil_to_bytes(collage)
    
    # ============================================
    # PAGE TYPE 4: AI EDITORIAL POSTER (NATIVE LAYOUT)
    # ============================================
    
    async def generate_editorial_poster(
        self,
        garment_front: bytes,
        category: str,
        theme_id: str,
        setting_id: str,
        pose_id: str,
        age_range: List[int],
        keywords: str = "",
        quality: str = "2K"
    ) -> bytes:
        """
        Generate a complete AI-Native Editorial Poster.
        The AI acts as Photographer + Art Director + Graphic Designer.
        It generates the image AND the layout/typography in one shot.
        """
        
        cat_config = CATEGORY_CONFIG.get(category, CATEGORY_CONFIG["men"])
        theme = PRO_THEMES.get(theme_id, PRO_THEMES["clean_white"])
        setting = PRO_SETTINGS.get(setting_id, PRO_SETTINGS["white_studio"])
        pose = PRO_POSES.get(pose_id, PRO_POSES["catalog_standard"])
        
        if "female" in cat_config["desc"] or "girl" in cat_config["desc"]:
            appearance = get_random_female_appearance()
        else:
            appearance = get_random_male_appearance()
            
        skin_tone = get_random_skin_tone()
        skin_desc = SKIN_TONES[skin_tone]
        
        prompt = f"""{GARMENT_PRESERVATION_BLOCK}

═══════════════════════════════════════════════════════════════════════════════
GENERATE: HIGH-FASHION EDITORIAL POSTER (IMAGE + TYPOGRAPHY)
═══════════════════════════════════════════════════════════════════════════════

ROLE: You are the world's best Fashion Art Director & Graphic Designer (Vogue, Harper's Bazaar).
TASK: Elaborate a single, stunning fashion poster that integrates the model photography with ELEGANT MINIMAL TYPOGRAPHY.

1. THE SUBJECT (PHOTOGRAPHY):
- Subject: {cat_config['desc']}, {age_range[0]}-{age_range[1]} years old, {skin_desc}
- Garment: WEARING THE EXACT REFERENCE GARMENT. NO CHANGES.
- Pose: {pose['prompt']}
- Setting: {setting['prompt']}
- Lighting: {setting['lighting']}

2. THE LAYOUT (GRAPHIC DESIGN):
- DO NOT just generate a photo. Generate a COMPLETE POSTER.
- COMPOSITION: Use ample NEGATIVE SPACE (e.g., clear sky, plain wall, studio void) to place text.
- STYLE: {theme['mood']} - Minimal, sophisticated, undistorted.
- COLOR PALETTE: {theme['colors']['primary']} dominant, perfectly matching the theme.

3. THE TYPOGRAPHY (TEXT):
- INVENT A HEADLINE: Create a short, sophisticated 2-3 word marketing headline relevant to '{theme['name']}' (e.g., "URBAN FLOW", "SUMMER SOUL", "PURE FORM", "MODERN ERA").
- FONT STYLE: Use elegant, thin, high-fashion fonts (Serif or Modern Sans). 
- PLACEMENT: Place text artistically in the negative space (top, bottom, or side).
- DO NOT cover the garment with text.
- Text must be legible, sharp, and look like a real magazine spread.

4. FINAL POLISH:
- The entire image should look like a finished PDF page from a high-end catalog.
- Smooth, noise-free, 4K resolution.

OUTPUT: A single image file containing the composed poster with model and text.
"""
        return await self._generate_image(prompt, garment_front, "3:4", quality)
    
    # ============================================
    # SPECIAL PAGES
    # ============================================
    
    async def generate_cover_page(
        self,
        logo_bytes: Optional[bytes],
        catalog_name: str,
        catalog_number: str,
        theme_id: str,
        quality: str = "2K"
    ) -> bytes:
        """Generate catalog cover page"""
        
        theme = PRO_THEMES.get(theme_id, PRO_THEMES["clean_white"])
        
        # Create cover image
        width, height = 1600, 2000
        cover = Image.new('RGB', (width, height), color=theme['colors']['primary'])
        draw = ImageDraw.Draw(cover)
        
        # Try to load fonts (fallback to default if not available)
        try:
            title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 80)
            subtitle_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 40)
        except:
            title_font = ImageFont.load_default()
            subtitle_font = ImageFont.load_default()
        
        # Add logo if provided
        if logo_bytes:
            try:
                logo = Image.open(BytesIO(logo_bytes))
                # Scale logo
                logo_max_width = 400
                if logo.width > logo_max_width:
                    ratio = logo_max_width / logo.width
                    logo = logo.resize(
                        (int(logo.width * ratio), int(logo.height * ratio)),
                        Image.Resampling.LANCZOS
                    )
                # Center logo
                logo_x = (width - logo.width) // 2
                logo_y = 200
                if logo.mode == 'RGBA':
                    cover.paste(logo, (logo_x, logo_y), logo)
                else:
                    cover.paste(logo, (logo_x, logo_y))
            except:
                pass
        
        # Add catalog name
        text_color = theme['colors']['accent']
        
        # Catalog name centered
        bbox = draw.textbbox((0, 0), catalog_name, font=title_font)
        text_width = bbox[2] - bbox[0]
        draw.text(
            ((width - text_width) // 2, height // 2),
            catalog_name,
            fill=text_color,
            font=title_font
        )
        
        # Catalog number
        if catalog_number:
            bbox = draw.textbbox((0, 0), catalog_number, font=subtitle_font)
            text_width = bbox[2] - bbox[0]
            draw.text(
                ((width - text_width) // 2, height // 2 + 100),
                catalog_number,
                fill=text_color,
                font=subtitle_font
            )
        
        return self._pil_to_bytes(cover)
    
    async def generate_thank_you_page(
        self,
        logo_bytes: Optional[bytes],
        theme_id: str
    ) -> bytes:
        """Generate thank you / closing page"""
        
        theme = PRO_THEMES.get(theme_id, PRO_THEMES["clean_white"])
        
        width, height = 1600, 2000
        page = Image.new('RGB', (width, height), color=theme['colors']['primary'])
        draw = ImageDraw.Draw(page)
        
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 60)
        except:
            font = ImageFont.load_default()
        
        text = "Thank You"
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        draw.text(
            ((width - text_width) // 2, height // 2),
            text,
            fill=theme['colors']['accent'],
            font=font
        )
        
        return self._pil_to_bytes(page)


# Convenience function
def create_pro_generator():
    return ProGenerationService()
