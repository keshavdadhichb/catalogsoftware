"""
Gemini 3 Pro Image (Nano Banana Pro) API Client
Native 2K/4K High-Quality Virtual Try-On Photo Generation

Features:
- Simple model photos (virtual try-on)
- Marketing catalog posters (with themes, props, typography)
- Hybrid overlay system for perfect text
"""

import os
import asyncio
import random
import hashlib
from io import BytesIO
from pathlib import Path
from typing import Optional, Literal, List
from PIL import Image
from google import genai
from google.genai import types


# Cache directory for generated images
if os.getenv("VERCEL"):
    CACHE_DIR = Path("/tmp/cache/generated_images")
else:
    CACHE_DIR = Path(__file__).parent.parent / "cache" / "generated_images"

CACHE_DIR.mkdir(parents=True, exist_ok=True)


# ============================================
# MODEL CONFIGURATIONS
# ============================================

MODEL_CONFIG = {
    "men": {"description": "adult Indian male", "age_range": "25-35 years old", "default_build": "athletic build"},
    "women": {"description": "adult Indian female", "age_range": "25-35 years old", "default_build": "slim build"},
    "teen_boy": {"description": "Indian teenage boy", "age_range": "14-18 years old", "default_build": "lean athletic build"},
    "teen_girl": {"description": "Indian teenage girl", "age_range": "14-18 years old", "default_build": "slim build"},
    "infant_boy": {"description": "young Indian boy child", "age_range": "6-10 years old", "default_build": "child proportions"},
    "infant_girl": {"description": "young Indian girl child", "age_range": "6-10 years old", "default_build": "child proportions"}
}

SKIN_TONES = {
    "fair": "fair North Indian skin tone, light porcelain complexion typical of Kashmir/Punjab/Himachal, glowing healthy skin",
    "light": "light wheat complexion, North Indian skin tone, warm golden undertones, clear skin",
    "wheatish": "wheatish skin tone, classic Indian complexion, warm golden-olive undertones",
    "medium": "medium brown Indian skin tone, warm olive undertones, even complexion",
    "medium brown": "medium brown skin tone, typical of Central India, healthy glow",
    "dark brown": "dark brown skin tone, South Indian complexion, rich melanin, radiant skin",
    "deep": "deep dark skin tone, beautiful ebony complexion, luminous skin"
}

FIT_TYPES = {
    "slim": "slim fit garment, tailored close to the body, clean modern silhouette, hugging the torso and limbs naturally",
    "regular": "regular fit garment, standard classic fit, comfortable and neat drape, not too tight and not too loose",
    "boxy": "boxy fit garment, square structured silhouette, wide and relaxed, cropped or standard length, flat drape",
    "oversized": "oversized fit garment, intentionally large and roomy, drop shoulders, long sleeves, very relaxed street-style drape",
    "loose": "loose fit garment, relaxed and comfortable, flowy and spacious silhouette, offering ease of movement"
}

# ============================================
# EXPANDED POSES (NEW!)
# ============================================

POSE_TYPES = {
    # Standing poses
    "catalog_standard": "classic catalog pose, standing straight with hands relaxed at sides, feet shoulder-width apart, confident shoulders-back stance, direct eye contact",
    "hands_on_hips": "power pose with hands firmly on hips, elbows out, weight on one leg, confident assertive expression",
    "arms_crossed": "arms crossed casually across chest, relaxed confident stance, slight head tilt, approachable expression",
    "hands_in_pockets": "relaxed stance with both hands in pockets, weight shifted to one leg, casual cool demeanor",
    "one_hand_pocket": "one hand casually in pocket, other arm relaxed at side, natural confident stance",
    
    # Walking/Movement poses
    "walking": "mid-stride walking pose, one leg forward, natural arm swing, fluid movement, captured motion",
    "walking_towards": "walking towards camera with purpose, confident stride, direct eye contact",
    "dynamic_movement": "dynamic energetic movement pose, body in motion, action shot feel, athletic energy",
    
    # Sitting poses (NEW!)
    "sitting_chair": "sitting casually on a sleek modern designer chair, legs crossed elegantly, one arm resting on armrest, relaxed confident model pose",
    "sitting_stool": "sitting on a high stool, one foot on footrest, leaning slightly forward, engaging pose",
    "sitting_floor": "sitting cross-legged on the floor, relaxed urban street style pose, hands resting on knees",
    "sitting_edge": "sitting on the edge of a platform/box, legs dangling, casual youthful energy",
    
    # Leaning poses (NEW!)
    "leaning_wall": "leaning casually against a wall, one foot flat against wall, arms crossed or in pockets, cool relaxed vibe",
    "leaning_forward": "leaning forward slightly towards camera, hands on knees or thighs, engaging intense look",
    "shoulder_lean": "leaning on one shoulder against wall, relaxed street style pose, nonchalant attitude",
    
    # Dynamic poses (NEW!)
    "crouching": "low athletic crouch, one knee down, dynamic street style pose, intense focused expression",
    "jumping": "captured mid-air jump, legs bent, arms dynamic, energetic joyful expression, athletic",
    "stretching": "casual stretch pose, arms above head, relaxed expression, showing garment fit",
    "turning": "captured mid-turn, body in rotation, dynamic fashion photography moment",
    
    # Editorial poses (NEW!)
    "editorial_dramatic": "high-fashion editorial pose, dramatic angle, one hand touching face or hair, intense gaze",
    "editorial_relaxed": "editorial soft pose, slight lean, natural lighting expression, effortless chic"
}

# ============================================
# EXPANDED SHOT ANGLES
# ============================================

SHOT_ANGLES = {
    "front_facing": "facing directly towards camera, straight-on shot, direct eye contact, symmetrical framing",
    "three_quarter": "3/4 angle view, body turned 30-45 degrees, one shoulder closer to camera, dynamic depth",
    "side_profile": "full side profile view, body turned 90 degrees, showcasing garment silhouette",
    "low_angle": "low angle hero shot, camera looking up at model, powerful commanding presence",
    "high_angle": "slight high angle, camera above eye level, approachable friendly feel",
    "dutch_angle": "slight dutch angle tilt, creative dynamic composition, editorial style",
    "over_shoulder": "shot from slightly behind over the shoulder, showing back of garment",
    "dynamic": "dynamic varied angle, movement captured, action photography style"
}

# ============================================
# EXPANDED PROPS (NEW!)
# ============================================

PROP_INTERACTION = {
    "none": "no props, hands naturally positioned - in pockets, at sides, or arms crossed",
    
    # Sports
    "basketball": "holding a basketball casually on one shoulder or tucked under arm, confident sporty stance",
    "skateboard": "standing with one foot on skateboard, or holding skateboard under arm, street style cool",
    "football": "holding a football casually, athletic sporty pose",
    "tennis_racket": "holding tennis racket over shoulder, preppy athletic look",
    
    # Accessories (NEW!)
    "cap": "wearing a trendy baseball cap, brim slightly to the side or backwards, street style",
    "beanie": "wearing a stylish beanie/knit cap, casual cool winter vibe",
    "sunglasses": "wearing stylish sunglasses (aviators or wayfarers), cool mysterious vibe",
    "sunglasses_holding": "holding sunglasses in hand or hooked on collar, casual gesture",
    "watch": "visible luxury wristwatch, wrist positioned to show watch prominently",
    "chain": "wearing a gold or silver chain necklace visible over/under the garment",
    "bracelet": "visible stylish bracelet or wristband, casual accessories",
    
    # Bags (NEW!)
    "backpack": "wearing a trendy backpack on one shoulder, urban street style",
    "sling_bag": "wearing cross-body sling bag, modern casual look",
    "duffle_bag": "holding gym duffle bag, athletic lifestyle vibe",
    
    # Lifestyle (NEW!)
    "headphones": "wearing over-ear headphones around neck or on head, music lover vibe",
    "earbuds": "wireless earbuds in ears, modern tech-savvy look",
    "coffee": "holding takeaway coffee cup casually, urban lifestyle pose",
    "phone": "casually looking at or holding smartphone, modern connected lifestyle",
    "book": "holding a book or magazine, intellectual casual vibe",
    
    # Furniture (NEW!)
    "chair": "interacting with a modern designer chair - sitting, leaning, or standing near",
    "stool": "using a high stool as prop - sitting or leaning",
    "box": "sitting on or leaning against a studio box/cube",
    
    # Creative (NEW!)
    "jacket_shoulder": "jacket draped over one shoulder, additional styling layer",
    "hoodie_up": "hoodie worn with hood up, street style urban look",
    "hands_gesture": "expressive hand gestures, talking/pointing, dynamic interaction"
}

# ============================================
# MARKETING THEME CONFIGURATIONS
# ============================================

THEME_CONFIG = {
    "studio_minimal": {
        "background_desc": "clean pure white seamless studio backdrop with subtle shadows",
        "lighting": "Professional soft diffused studio lighting, beauty dish key light, no harsh shadows",
        "mood": "Clean, minimal, premium commercial catalog",
        "camera": "Shot on Sony A7R IV with 85mm f/1.4 lens, crisp sharp focus"
    },
    "varsity_locker": {
        "background_desc": "high-school locker room setting with navy blue metal lockers in background, polished floor",
        "lighting": "Cinematic high-contrast lighting, strong rim lights, cool blue tones",
        "mood": "Energetic, athletic, youthful, sporty cool",
        "camera": "Shot on Canon 5D Mark IV, 50mm lens, dramatic lighting"
    },
    "studio_color": {
        "background_desc": "solid colored studio wall (complementary to garment color) with matching floor",
        "lighting": "Professional softbox lighting with colored gels, even illumination",
        "mood": "Commercial, vibrant, premium lookbook style",
        "camera": "Medium format Hasselblad quality, exceptional detail"
    },
    "urban_street": {
        "background_desc": "urban street setting with graffiti walls, concrete textures, city environment",
        "lighting": "Natural golden hour lighting, warm tones, authentic street photography",
        "mood": "Edgy, street style, raw urban cool, authentic",
        "camera": "Shot on Fuji X-T4, 35mm lens, film grain aesthetic"
    },
    "abstract_color": {
        "background_desc": "abstract colorful gradient background with flowing purple, orange, and blue tones",
        "lighting": "Creative artistic lighting with colored highlights",
        "mood": "Artistic, bold, modern, creative campaign",
        "camera": "Fashion editorial style photography, high contrast"
    },
    "industrial": {
        "background_desc": "industrial warehouse setting with exposed brick, metal beams, raw textures",
        "lighting": "Moody directional lighting, dramatic shadows, industrial feel",
        "mood": "Edgy, raw, urban industrial, fashion forward",
        "camera": "Shot with dramatic contrast, selective focus"
    },
    "nature_outdoor": {
        "background_desc": "natural outdoor setting with soft bokeh foliage background",
        "lighting": "Soft natural daylight, golden hour warmth",
        "mood": "Fresh, natural, organic, lifestyle",
        "camera": "Shot at f/2.8, beautiful background blur"
    },
    "neon_night": {
        "background_desc": "night city setting with neon lights, urban nightlife atmosphere",
        "lighting": "Neon colored lighting, pink and blue tones, night photography",
        "mood": "Nightlife, edgy, modern, vibrant energy",
        "camera": "High ISO night photography, neon glow effects"
    }
}

# ============================================
# LAYOUT STYLES
# ============================================

LAYOUT_STYLES = {
    "framed_breakout": "A clean white rectangular outline frame positioned behind the model. The model's head and one foot should slightly overlap/break outside the frame to create visual depth and dimension. Clean negative space around the frame for text placement.",
    "magazine_style": "High-fashion editorial magazine layout. Bold asymmetric composition. Model positioned dynamically with ample space for text elements. Fashion magazine cover aesthetic.",
    "full_bleed": "Edge-to-edge full bleed image composition with no borders. Model as hero element. Space at bottom for text overlay with subtle gradient fade.",
    "split_screen": "Creative split composition with model on one side and complementary negative space on other side for branding/text. Modern editorial design.",
    "centered_minimal": "Model perfectly centered with generous white space on all sides. Ultra-minimal clean aesthetic. Maximum focus on the garment.",
    "off_center_dramatic": "Model positioned off-center using rule of thirds. Dramatic negative space for bold typography. High-fashion campaign feel."
}

# ============================================
# STYLE PRESETS (NEW!)
# ============================================

STYLE_PRESETS = {
    "editorial_high_fashion": {
        "description": "High-end fashion editorial style",
        "pose": "editorial_dramatic",
        "angle": "three_quarter",
        "theme": "studio_minimal",
        "layout": "magazine_style",
        "prompt_addon": "High-fashion editorial photography. Dramatic lighting. Shot for Vogue or GQ. Exceptional attention to styling details."
    },
    "street_urban": {
        "description": "Urban streetwear photography",
        "pose": "leaning_wall",
        "angle": "low_angle",
        "theme": "urban_street",
        "layout": "full_bleed",
        "prompt_addon": "Authentic street photography vibe. Raw urban energy. Hypebeast aesthetic. Shot like Supreme or Off-White lookbook."
    },
    "catalog_clean": {
        "description": "Clean e-commerce catalog style",
        "pose": "catalog_standard",
        "angle": "front_facing",
        "theme": "studio_minimal",
        "layout": "centered_minimal",
        "prompt_addon": "Clean, crisp e-commerce photography. Crystal clear product focus. Shot like Zara or Uniqlo catalog."
    },
    "sporty_athletic": {
        "description": "Athletic sportswear style",
        "pose": "dynamic_movement",
        "angle": "dynamic",
        "theme": "varsity_locker",
        "layout": "framed_breakout",
        "prompt_addon": "Dynamic athletic photography. Energy and movement. Shot like Nike or Adidas campaign."
    },
    "lifestyle_casual": {
        "description": "Casual lifestyle photography",
        "pose": "sitting_chair",
        "angle": "three_quarter",
        "theme": "nature_outdoor",
        "layout": "off_center_dramatic",
        "prompt_addon": "Relaxed lifestyle photography. Natural and authentic. Shot like lifestyle brand campaign."
    }
}

# ============================================
# STRICT GARMENT PRESERVATION RULES
# ============================================

STRICT_GARMENT_RULES = """
╔═══════════════════════════════════════════════════════════════════════════╗
║  ⛔⛔⛔ ABSOLUTE CRITICAL - GARMENT MUST BE PIXEL-PERFECT COPY ⛔⛔⛔     ║
╚═══════════════════════════════════════════════════════════════════════════╝

The garment in the reference image is a REAL PRODUCT being sold.
ANY modification makes the output COMPLETELY WORTHLESS and UNUSABLE.

🚫 ABSOLUTELY FORBIDDEN - DO NOT DO ANY OF THESE:
╔═══════════════════════════════════════════════════════════════════════════╗
║ • DO NOT change or modify ANY collar design, color, or pattern           ║
║ • DO NOT alter ANY logo, emblem, badge, or brand mark                    ║
║ • DO NOT change ANY text, letters, typography, or numbers                ║
║ • DO NOT modify ANY graphic, print, illustration, or artwork             ║
║ • DO NOT change the POSITION of any design element                       ║
║ • DO NOT change the SIZE of any design element                           ║
║ • DO NOT change ANY COLOR on the garment (fabric or prints)              ║
║ • DO NOT add elements not present in the reference                       ║
║ • DO NOT remove elements present in the reference                        ║
║ • DO NOT "improve" or "enhance" any design - COPY EXACTLY                ║
║ • DO NOT simplify or reinterpret any complex graphics                    ║
╚═══════════════════════════════════════════════════════════════════════════╝

✅ YOU MUST DO THESE:
╔═══════════════════════════════════════════════════════════════════════════╗
║ • COPY every logo/graphic PIXEL-FOR-PIXEL exactly as shown               ║
║ • MAINTAIN exact position of all design elements                         ║
║ • PRESERVE exact colors (if striped collar, same stripe colors)          ║
║ • KEEP exact shape and size of all graphics/prints                       ║
║ • If garment has ribbed collar with stripes → output SAME stripes        ║
║ • If garment has a chest print → output IDENTICAL chest print            ║
║ • If garment has back graphic → output SAME back graphic                 ║
╚═══════════════════════════════════════════════════════════════════════════╝

⚠️ FINAL CHECK: Before generating output, verify:
1. Collar design matches reference EXACTLY
2. All prints/graphics match reference EXACTLY
3. Fabric color matches reference EXACTLY
4. All text on garment matches reference EXACTLY
"""

# ============================================
# CREATIVE PHRASES FOR CATALOG PAGES
# ============================================

CREATIVE_PHRASES = [
    # Style & Fashion
    "Effortless Style",
    "Urban Edge",
    "Street Ready",
    "Fresh Look",
    "Modern Classic",
    "Cool Factor",
    "Style Statement",
    
    # Comfort & Feel
    "Pure Comfort",
    "Easy Going",
    "All Day Comfort",
    "Soft Touch",
    "Perfect Fit",
    
    # Season & Vibe
    "Summer Vibes",
    "Spring Essential",
    "Weekend Ready",
    "City Life",
    "Day to Night",
    
    # Quality & Craftsmanship
    "Premium Quality",
    "Fine Details",
    "Crafted with Care",
    "Quality Matters",
]

# ============================================
# MAGAZINE-STYLE LAYOUT VARIATIONS
# ============================================

CATALOG_LAYOUT_STYLES = [
    {
        "name": "hero_center",
        "description": "Model centered with ample negative space, clean minimal composition",
        "model_position": "perfectly centered",
        "text_position": "small phrase at bottom corner"
    },
    {
        "name": "off_center_left",
        "description": "Model positioned on left third, dynamic negative space on right",
        "model_position": "left side, rule of thirds",
        "text_position": "elegant phrase on right side with breathing room"
    },
    {
        "name": "off_center_right",
        "description": "Model positioned on right third, artistic space on left",
        "model_position": "right side, rule of thirds",
        "text_position": "subtle phrase on left side"
    },
    {
        "name": "low_angle_hero",
        "description": "Dramatic low angle shot making model look powerful",
        "model_position": "center frame, shot from below",
        "text_position": "phrase at bottom edge"
    },
    {
        "name": "three_quarter_dynamic",
        "description": "3/4 angle with model turning, movement feel",
        "model_position": "slight angle, body in rotation",
        "text_position": "corner placement"
    },
    {
        "name": "editorial_crop",
        "description": "Tight framing focusing on torso and garment details",
        "model_position": "cropped at thighs, focus on upper body",
        "text_position": "minimal, bottom edge"
    }
]

class GeminiClient:
    """Client for Gemini Image Generation with fallback support"""
    
    # Primary model for 2K/4K generation
    PRIMARY_MODEL = "gemini-3-pro-image-preview"
    # Fallback model (also supports image generation)
    FALLBACK_MODEL = "gemini-2.5-flash-image"
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY environment variable is required")
        
        self.client = genai.Client(api_key=self.api_key)
        self.model = self.PRIMARY_MODEL
    
    # Timeout for API calls (2 minutes per image)
    API_TIMEOUT = 120
    
    # ============================================
    # CACHING METHODS
    # ============================================
    
    def _get_cache_key(self, *args) -> str:
        """Generate a unique cache key from input parameters"""
        # Create a hash from all input arguments
        key_data = ""
        for arg in args:
            if isinstance(arg, bytes):
                # For image bytes, use first/last bytes + length as fingerprint
                key_data += f"img_{len(arg)}_{hashlib.md5(arg).hexdigest()[:8]}_"
            elif arg is not None:
                key_data += f"{str(arg)}_"
        
        return hashlib.sha256(key_data.encode()).hexdigest()[:32]
    
    def _get_cached_image(self, cache_key: str) -> Optional[bytes]:
        """Check if image exists in cache and return it"""
        cache_path = CACHE_DIR / f"{cache_key}.png"
        if cache_path.exists():
            print(f"✅ Cache HIT: {cache_key[:8]}...")
            return cache_path.read_bytes()
        return None
    
    def _cache_image(self, cache_key: str, image_bytes: bytes) -> None:
        """Save generated image to cache"""
        cache_path = CACHE_DIR / f"{cache_key}.png"
        cache_path.write_bytes(image_bytes)
        print(f"💾 Cached: {cache_key[:8]}... ({len(image_bytes)} bytes)")
    
    async def _generate_with_timeout(self, model, contents, config):
        """Wrapper to add timeout to generation calls"""
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
            raise TimeoutError(f"Image generation timed out after {self.API_TIMEOUT} seconds")
    
    def _image_to_pil(self, image_bytes: bytes) -> Image.Image:
        """Convert image bytes to PIL Image with robust error handling"""
        if not image_bytes:
            raise ValueError("Empty image data received")
        
        if len(image_bytes) < 100:
            raise ValueError(f"Image data too small ({len(image_bytes)} bytes) - likely corrupted upload")
        
        try:
            img = Image.open(BytesIO(image_bytes))
            # Force load to detect corrupt images early
            img.load()
            # Convert to RGB if needed (handles RGBA, P mode, etc)
            if img.mode not in ('RGB', 'L'):
                img = img.convert('RGB')
            return img
        except Exception as e:
            # Try to detect file type for better error message
            header = image_bytes[:20]
            if header.startswith(b'<!DOCTYPE') or header.startswith(b'<html'):
                raise ValueError("Received HTML instead of image - check your upload")
            elif header.startswith(b'{') or header.startswith(b'['):
                raise ValueError("Received JSON instead of image - check your upload")
            else:
                raise ValueError(f"Invalid image format: {str(e)[:100]}")
    
    def _pil_to_bytes(self, image: Image.Image, format: str = "PNG") -> bytes:
        """Convert PIL Image to bytes with MAXIMUM quality"""
        buffer = BytesIO()
        if format.upper() == "PNG":
            image.save(buffer, format="PNG", optimize=False)
        else:
            image.save(buffer, format="JPEG", quality=100, subsampling=0)
        buffer.seek(0)
        return buffer.getvalue()
    
    def _validate_image_bytes(self, data: bytes) -> bytes:
        """Validate that bytes are a valid image, convert if needed"""
        try:
            # Try to open as image to validate
            img = Image.open(BytesIO(data))
            # Re-save as PNG to ensure correct format
            buffer = BytesIO()
            img.save(buffer, format="PNG")
            buffer.seek(0)
            return buffer.getvalue()
        except Exception as e:
            print(f"Image validation failed: {e}")
            raise ValueError(f"Invalid image data: {e}")
    
    def _extract_image_from_response(self, response) -> bytes:
        """Extract image from Gemini response with robust fallbacks"""
        import base64
        
        parts = None
        if hasattr(response, 'parts') and response.parts:
            parts = response.parts
        elif hasattr(response, 'candidates') and response.candidates:
            if response.candidates[0].content and response.candidates[0].content.parts:
                parts = response.candidates[0].content.parts
        
        if not parts:
            print(f"Response has no parts. Type: {type(response)}")
            if hasattr(response, 'text'):
                print(f"Response text: {response.text[:500] if response.text else 'None'}")
            raise ValueError("No parts found in response - API may have returned text only")
        
        for part in parts:
            # Method 1: inline_data.data (raw bytes)
            if hasattr(part, 'inline_data') and part.inline_data is not None:
                if hasattr(part.inline_data, 'data'):
                    data = part.inline_data.data
                    if data:
                        print(f"Got inline_data, length: {len(data)}, type: {type(data)}")
                        # Check if it's base64 encoded string
                        if isinstance(data, str):
                            try:
                                data = base64.b64decode(data)
                            except:
                                pass
                        return self._validate_image_bytes(data)
            
            # Method 2: as_image() returns PIL Image
            if hasattr(part, 'as_image'):
                try:
                    img = part.as_image()
                    if img:
                        print(f"Got as_image, type: {type(img)}")
                        buffer = BytesIO()
                        # Try positional arg first (Google's Image object)
                        try:
                            img.save(buffer, "PNG")
                        except TypeError:
                            # Fall back to keyword arg (PIL Image)
                            img.save(buffer, format="PNG")
                        buffer.seek(0)
                        return buffer.getvalue()
                except Exception as e:
                    print(f"as_image() failed: {e}")
            
            # Method 3: Check for image_bytes attribute
            for attr in ['image_bytes', '_image_bytes', 'data']:
                if hasattr(part, attr):
                    data = getattr(part, attr)
                    if data and isinstance(data, (bytes, bytearray)):
                        print(f"Got {attr}, length: {len(data)}")
                        return self._validate_image_bytes(data)
            
            # Log text parts
            if hasattr(part, 'text') and part.text:
                print(f"Got text part: {part.text[:200]}...")
        
        raise ValueError("No image found in response")

    # ============================================
    # SIMPLE PHOTO GENERATION
    # ============================================

    async def generate_model_image(
        self,
        garment_image: bytes,
        category: str,
        view: Literal["front", "back"],
        skin_tone: str = "fair",
        hair_type: str = "short black hair",
        body_type: str = "",
        shot_angle: str = "front_facing",
        pose_type: str = "catalog_standard",
        fit_type: str = "regular",
        creative_direction: str = "",
        image_quality: str = "4K"  # Options: "1K", "2K", "4K"
    ) -> bytes:
        """Generate a simple virtual try-on photo"""
        
        config = MODEL_CONFIG.get(category, MODEL_CONFIG["teen_boy"])
        skin_desc = SKIN_TONES.get(skin_tone, SKIN_TONES.get("fair", skin_tone))
        angle_desc = SHOT_ANGLES.get(shot_angle, SHOT_ANGLES["front_facing"])
        pose_desc = POSE_TYPES.get(pose_type, POSE_TYPES["catalog_standard"])
        fit_desc = FIT_TYPES.get(fit_type, FIT_TYPES.get("regular", fit_type))
        build = body_type if body_type else config["default_build"]
        
        prompt = f"""
╔════════════════════════════════════════════════════════════════════════╗
║  ⛔⛔⛔ ABSOLUTE CRITICAL RULE - GARMENT MUST BE PIXEL-PERFECT ⛔⛔⛔  ║
╚════════════════════════════════════════════════════════════════════════╝

STUDY THE REFERENCE GARMENT IMAGE VERY CAREFULLY BEFORE GENERATING.

The garment in the reference image is a REAL PRODUCT being sold.
ANY modification to the garment makes the output WORTHLESS and UNUSABLE.

🚫 FORBIDDEN - DO NOT DO ANY OF THESE:
- DO NOT change, modify, or reinterpret ANY logo on the garment
- DO NOT alter ANY emblem, badge, or brand mark on the garment
- DO NOT change the position of ANY design element
- DO NOT modify ANY text, letters, or numbers on the garment
- DO NOT change ANY graphic, print, or pattern
- DO NOT change the COLOR of anything on the garment
- DO NOT add ANY new elements that aren't in the reference
- DO NOT remove ANY elements that are in the reference
- DO NOT "improve" or "enhance" any design - COPY EXACTLY

✅ REQUIRED - YOU MUST:
- Copy the EXACT logo pixel-for-pixel as shown in reference
- Copy the EXACT position of all design elements
- Copy the EXACT colors (gray is gray, yellow is yellow, etc.)
- Copy the EXACT shape and size of all graphics
- The garment on the model MUST look IDENTICAL to the reference

If the reference shows a small yellow logo on the left chest → output MUST have the SAME small yellow logo in the SAME position with the SAME design.

═══════════════════════════════════════════════════════════════════════════

Now generate a professional catalog photo:

MODEL:
- Subject: {config['description']}, {config['age_range']}
- Skin: {skin_desc}
- Hair: {hair_type}
- Build: {build}
- Expression: Natural, confident

FIT:
- Style: Worn in a {fit_desc}

CAMERA:
- View: {view} view
- Angle: {angle_desc}
- Pose: {pose_desc}
- Framing: Full body, head to toe
- Background: Pure white (#FFFFFF) seamless studio

PHOTOGRAPHY:
- Lighting: Soft diffused beauty lighting
- Quality: Ultra-sharp, professional fashion photography
- Style: Premium catalog (Zara, H&M quality)

{f"DIRECTION: {creative_direction}" if creative_direction else ""}

⚠️ FINAL CHECK: Before outputting, verify the garment logo/design matches EXACTLY.
Output: Photorealistic image with the EXACT SAME garment from reference."""

        garment_pil = self._image_to_pil(garment_image)
        
        # Try primary model first, fallback to simpler model if fails
        for attempt, model_to_use in enumerate([self.PRIMARY_MODEL, self.FALLBACK_MODEL]):
            try:
                print(f"Attempting photo generation with {model_to_use} (attempt {attempt + 1})")
                
                response = await self._generate_with_timeout(
                    model=model_to_use,
                    contents=[prompt, garment_pil],
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE"],
                        image_config=types.ImageConfig(
                            aspect_ratio="3:4",
                            image_size=image_quality if model_to_use == self.PRIMARY_MODEL else None
                        )
                    )
                )
                
                return self._extract_image_from_response(response)
                
            except Exception as e:
                print(f"Model {model_to_use} failed: {e}")
                if attempt == 1:  # Last attempt
                    raise
                print("Retrying with fallback model...")
        
        raise ValueError("All models failed to generate image")

    # ============================================
    # MARKETING POSTER GENERATION
    # ============================================

    async def generate_marketing_poster(
        self,
        garment_image: bytes,
        logo_image: Optional[bytes],
        category: str,
        skin_tone: str = "fair",
        body_type: str = "",
        marketing_theme: str = "studio_minimal",
        prop: str = "none",
        pose_type: str = "catalog_standard",
        fit_type: str = "regular",
        shot_angle: str = "front_facing",
        layout_style: str = "hero_bottom",
        text_content: dict = None,
        image_quality: str = "4K"  # Options: "1K", "2K", "4K"
    ) -> bytes:
        """Generate marketing poster with layout-specific text rendering"""
        
        if text_content is None:
            text_content = {}
        
        config = MODEL_CONFIG.get(category, MODEL_CONFIG["teen_boy"])
        skin_desc = SKIN_TONES.get(skin_tone, SKIN_TONES.get("fair", skin_tone))
        theme = THEME_CONFIG.get(marketing_theme, THEME_CONFIG["studio_minimal"])
        prop_desc = PROP_INTERACTION.get(prop, PROP_INTERACTION["none"])
        pose_desc = POSE_TYPES.get(pose_type, POSE_TYPES["catalog_standard"])
        fit_desc = FIT_TYPES.get(fit_type, FIT_TYPES.get("regular", fit_type))
        angle_desc = SHOT_ANGLES.get(shot_angle, SHOT_ANGLES["front_facing"])
        build = body_type if body_type else config["default_build"]
        
        # Build layout-specific text instructions
        text_instructions = self._build_text_instructions(layout_style, text_content)
        layout_prompt = self._get_layout_prompt(layout_style)
        
        prompt = f"""You are a world-class Fashion Commercial Photographer creating a marketing poster.

╔══════════════════════════════════════════════════════════════════╗
║  🎯 PRIORITY 1: GARMENT PRESERVATION (HIGHEST PRIORITY)          ║
╚══════════════════════════════════════════════════════════════════╝

STUDY THE REFERENCE GARMENT IMAGE CAREFULLY BEFORE GENERATING.

✅ YOU MUST:
- Reproduce the EXACT garment from the reference image
- Keep the SAME color (if beige/cream, it stays beige/cream)
- Keep the SAME texture (cotton, smooth, ribbed, etc.)
- Keep the SAME fit (loose, fitted, oversized, etc.)
- Allow ONLY natural fabric behavior: draping, wrinkles, folds

❌ YOU MUST NOT (CRITICAL - ZERO TOLERANCE):
- ADD any text to the garment (no "SQUAD", "STYLE", "NYC", etc.)
- ADD any logo, emblem, or brand mark to the garment
- ADD any graphic, print, or design element to the garment
- CHANGE the garment color or material
- INVENT or IMAGINE any design that wasn't in the reference
- If reference shows PLAIN/SOLID garment → output MUST be PLAIN/SOLID

⚠️ CHECKPOINT: Before generating, confirm the reference garment is plain.
   If plain → NO text, NO graphics. If printed → reproduce EXACTLY.

╔══════════════════════════════════════════════════════════════════╗
║  🎯 PRIORITY 2: COMPOSITION & LAYOUT                              ║
╚══════════════════════════════════════════════════════════════════╝

{layout_prompt}

OUTPUT FORMAT:
- Aspect Ratio: 9:16 vertical (poster format)
- Resolution: 4K quality, print-ready
- Single cohesive image (no collage, no split frames)

╔══════════════════════════════════════════════════════════════════╗
║  🎯 PRIORITY 3: TYPOGRAPHY (POSTER TEXT ONLY)                     ║
╚══════════════════════════════════════════════════════════════════╝

{text_instructions}

✅ TYPOGRAPHY RULES:
- ALL text is OVERLAID on the image (NOT in a separate section below)
- Use MUTED, ELEGANT colors: soft white, cream, warm gray, taupe
- Use REFINED fonts: Cormorant Garamond, Playfair Display, Montserrat Light
- Text should feel UNDERSTATED and LUXURIOUS
- Think: Vogue, Harper's Bazaar, minimalist luxury

❌ TYPOGRAPHY DON'T:
- NO bright/neon colors (no orange, no red, no pink)
- NO chunky/bold/impact fonts
- NO separate white text box below the image
- NO text ON the garment itself

╔══════════════════════════════════════════════════════════════════╗
║  🎯 PRIORITY 4: MODEL & ENVIRONMENT                               ║
╚══════════════════════════════════════════════════════════════════╝

THE MODEL:
- Description: {config['description']}, {config['age_range']}
- Skin Tone: {skin_desc}
- Body Type: {build}
- Pose: {pose_desc}
- Camera Angle: {angle_desc}
- Garment Fit: {fit_desc}
- Props: {prop_desc}

THE ENVIRONMENT:
- Background: {theme['background_desc']}
- Lighting: {theme['lighting']}
- Mood: {theme['mood']}
- Camera Style: {theme['camera']}

✅ MODEL CONSISTENCY:
- Generate a realistic human model matching the description
- Natural skin texture, realistic proportions
- Model should look like a professional fashion model

❌ MODEL DON'T:
- NO distorted faces or hands
- NO unnatural body proportions
- NO floating limbs

╔══════════════════════════════════════════════════════════════════╗
║  📋 FINAL VALIDATION CHECKLIST                                    ║
╚══════════════════════════════════════════════════════════════════╝

Before outputting, verify:
□ Garment matches reference EXACTLY (no added text/graphics)
□ Layout follows the specified structure
□ Text is overlaid on image, NOT in separate section
□ Typography is muted and elegant
□ Model looks natural and realistic
□ Aspect ratio is 9:16 vertical

Generate the professional fashion marketing poster now."""

        garment_pil = self._image_to_pil(garment_image)
        
        contents = [prompt, garment_pil]
        
        # Add logo if provided
        if logo_image:
            logo_pil = self._image_to_pil(logo_image)
            contents.append(logo_pil)
        
        # Try primary model first, fallback if fails
        for attempt, model_to_use in enumerate([self.PRIMARY_MODEL, self.FALLBACK_MODEL]):
            try:
                print(f"Generating poster with {model_to_use} (attempt {attempt + 1})")
                
                response = await self._generate_with_timeout(
                    model=model_to_use,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE"],
                        image_config=types.ImageConfig(
                            aspect_ratio="9:16",
                            image_size=image_quality if model_to_use == self.PRIMARY_MODEL else None
                        )
                    )
                )
                
                return self._extract_image_from_response(response)
                
            except Exception as e:
                print(f"Model {model_to_use} failed: {e}")
                if attempt == 1:
                    raise
                print("Retrying with fallback...")
        
        raise ValueError("All models failed")
    
    def _get_layout_prompt(self, layout_style: str) -> str:
        """Get detailed layout instructions for each style - ALL text overlaid on image"""
        
        # Common premium typography guidance - ANTI-HALLUCINATION RULES
        typography_base = """
╔═══════════════════════════════════════════╗
║  ⛔ GARMENT PRESERVATION (CRITICAL)        ║
╚═══════════════════════════════════════════╝
❌ DO NOT add text, logos, or graphics to the GARMENT
❌ If garment is PLAIN → keep it PLAIN
✅ Keep garment EXACTLY as shown in reference image

╔═══════════════════════════════════════════╗
║  📝 TYPOGRAPHY RULES                       ║
╚═══════════════════════════════════════════╝
✅ DO:
- Overlay text DIRECTLY on the image
- Use MUTED colors (cream, white, gray, taupe)
- Use ELEGANT fonts (Cormorant, Playfair, Montserrat Light)
- Create ONE cohesive composition

❌ DON'T:
- Create separate text section below image
- Use bright/neon/poppy colors
- Use chunky bold fonts
- Put ANY text on the garment itself
"""
        
        layouts = {
            "hero_bottom": f"""
{typography_base}

HERO BOTTOM LAYOUT:
- Full-bleed image - model fills the ENTIRE canvas
- Text OVERLAID at the bottom 30% of the image
- Use a subtle dark gradient overlay (from transparent to semi-dark) at the bottom for text readability
- Headline: Large, bold, ALL CAPS (Montserrat Black or Bebas Neue style)
- Subtext: Lighter weight, elegant spacing
- The model's body continues BEHIND the text overlay
- NO white/colored box - gradient fades into the image
""",
            "split_vertical": f"""
{typography_base}

SPLIT VERTICAL LAYOUT:
- Full-bleed image with model on LEFT side
- RIGHT side: Semi-transparent color overlay (60-80% opacity) with text
- Text panel should NOT be a solid block - the image should subtly show through
- Use glassmorphic effect if possible
- Text aligned left on the overlay panel
- Typography: Headlines in Playfair Display or similar serif, subtext in Montserrat
- The background continues behind both sides - ONE unified image
""",
            "magazine_cover": f"""
{typography_base}

MAGAZINE COVER LAYOUT:
- Full-bleed image - model covers the entire canvas
- Brand/masthead OVERLAID at very top (elegant, condensed font)
- Headline text OVERLAID on lower-left or center, WITH the model behind it
- Use subtle shadows or glows for text legibility
- Classic Vogue/GQ magazine aesthetic
- Text can overlap with model where appropriate
- Typography: Mix of serif (headlines) and sans-serif (subtext)
""",
            "minimal_corner": f"""
{typography_base}

MINIMAL CORNER LAYOUT:
- Full-bleed image - model dominates 95% of the composition
- Only small brand text OVERLAID in one corner (top-left or bottom-right)
- Text should be subtle but legible (white with slight shadow)
- Maximum focus on garment and model
- Tagline if provided - very subtle, beneath brand
- Typography: Clean, refined sans-serif (Montserrat Light or similar)
""",
            "overlay_gradient": f"""
{typography_base}

OVERLAY GRADIENT LAYOUT:
- Full-bleed image of model - NO separate sections
- Dramatic dark gradient overlay from bottom (fades from 70% opacity black to transparent)
- All text appears OVER the gradient, in the lower portion
- Headline: Large, bold, striking (Bebas Neue or Montserrat ExtraBold)
- CTA styled like a soft button overlay if provided
- Model visible through the gradient - moody, editorial feel
""",
            "framed_border": f"""
{typography_base}

FRAMED BORDER LAYOUT:
- Full-bleed image with thin elegant border/frame OVERLAID on it
- Model is visible edge-to-edge, with decorative border as an overlay
- Text OVERLAID at bottom WITHIN the frame, on top of the image
- Elegant, gallery-exhibition style
- Typography: Refined serif fonts (Playfair Display) for headlines
- Subtle gradient under text for readability
""",
            "bold_typography": f"""
{typography_base}

BOLD TYPOGRAPHY LAYOUT:
- Full-bleed image with model
- MASSIVE headline text OVERLAID across the image (can span 60% of composition)
- Text should be semi-transparent or have creative opacity effects
- Model visible THROUGH or AROUND the large text
- Blend text with image artistically
- High-impact, editorial magazine style
- Typography: Bebas Neue, Impact, or condensed bold fonts at 200+ pt scale
""",
            "product_focus": f"""
{typography_base}

PRODUCT FOCUS LAYOUT:
- Full-bleed lifestyle image - model in natural pose
- Product info (name, price) OVERLAID elegantly on image
- Use subtle dark band or gradient for text area
- Clean but NOT separate from the image
- Typography: Contemporary sans-serif (Montserrat, Raleway)
- Price should be bold but tasteful
""",
            "diagonal_split": f"""
{typography_base}

DIAGONAL SPLIT LAYOUT:
- Full-bleed image with dynamic composition
- Diagonal line created by gradient or semi-transparent color overlay
- Model on one diagonal half, text on the other half's overlay
- The image continues behind both - unified composition
- Creates energy, movement, modern editorial feel
- Typography: Angular, bold fonts that complement the diagonal energy
""",
            "centered_minimal": f"""
{typography_base}

CENTERED MINIMAL LAYOUT:
- Full-bleed image - model perfectly centered
- Brand name OVERLAID at top of image (small, refined)
- Headline OVERLAID at bottom of image (larger, impactful)
- Maximum negative/breathing space
- Gallery-style elegance
- Typography: Thin, elegant (Montserrat Light or Playfair Display)
""",
            "story_card": f"""
{typography_base}

STORY CARD LAYOUT:
- Full-bleed 9:16 vertical image - model fills frame
- Small logo/icon OVERLAID in corner
- Headline and CTA OVERLAID at bottom with gradient behind
- Instagram Story aesthetic - modern, mobile-first
- Typography: Bold, readable at small sizes (Montserrat Bold, Oswald)
- Engage-focused design - quick, punchy text
""",
            "lookbook_spread": f"""
{typography_base}

LOOKBOOK SPREAD LAYOUT:
- Full-bleed editorial image
- Multiple text elements OVERLAID harmoniously across the composition
- Brand name top-left or top-center
- Headline strategically placed (could be beside model)
- Price and details as elegant overlays
- Fashion lookbook aesthetic - all text integrates with image
- Typography: Mix of display and body fonts, editorial hierarchy
""",
            "orange_diagonal": f"""
{typography_base}

ORANGE DIAGONAL BANNER LAYOUT (BONO Style):
- Split background: TOP half is clean white, BOTTOM half and borders are warm orange (#E67E22)
- Model placed CENTER, standing against the white portion
- Abstract black line art: circular and wavy shapes behind the model
- LARGE ORANGE DIAGONAL BANNER with white outline cuts across lower half of poster
- Text placements:
  * TOP: "BONO" in orange sans-serif font
  * Below: "Lifestyle" in smaller orange serif font
  * Website "bonostyle.in" in top right corner
  * Below diagonal banner: brand tagline in small black font
  * Large "01." numbering element
  * Row of social media icons (optional)
  * Vertical "B O N O" text element on right side with orange star shapes
- Typography: Mix of bold sans-serif and elegant serif, all in orange or black
- Feel: Modern, geometric, lifestyle brand aesthetic

🚫 GARMENT RULE: The t-shirt/garment must NOT be altered - keep EXACTLY as reference image
""",
            "yellow_vibrant": f"""
{typography_base}

YELLOW VIBRANT CATALOG LAYOUT (Modern Pop):
- Solid BRIGHT YELLOW background (#F1C40F)
- Model placed centrally in the composition (front or back view)
- Large PURPLE outline sans-serif text spelling "FASHION" at top
- Additional outline text partial letters on left side
- White horizontal banner with purple border in lower area containing:
  * Collection name in yellow text
  * Year in purple text
- Geometric elements scattered:
  * Purple dots arranged in grids
  * Thin purple horizontal and vertical lines
  * Purple rectangular outlines
- Vertical text "bonostyle.in" on right side
- Bottom text elements in large white outline font
- Typography: Bold sans-serif, purple and white colors

🚫 GARMENT RULE: The t-shirt/garment must NOT be altered - keep EXACTLY as reference image
""",
            "pink_elegant": f"""
{typography_base}

PINK ELEGANT FASHION SHOW LAYOUT (Runway Style):
- Soft, light PINK background (#FADBD8 or similar blush pink)
- Model positioned in lower center area
- Text hierarchy:
  * TOP: Large, bold, orange sans-serif text with collection/brand name
  * Below: Flowing orange script font saying "Fashion Collection" or similar
  * LEFT vertical bar: Date or event info in orange sans-serif
  * RIGHT vertical bar: Location or "BONO" in orange sans-serif
  * Each vertical text bar has thin orange vertical line accent
- Overall feel: Clean, modern, editorial, high-fashion
- Lots of breathing space, elegant minimalism
- Typography: Bold sans-serif headers, flowing script accents, all in warm orange tones

🚫 GARMENT RULE: The t-shirt/garment must NOT be altered - keep EXACTLY as reference image
""",
            "orange_framed": f"""
{typography_base}

ORANGE FRAMED CATALOG LAYOUT (Premium Frame):
- Solid DEEP ORANGE background (#D35400)
- Large WHITE rectangular frame with decorative corner accents encloses main content
- Model placed inside the frame
- Behind model: The word "FASHION" or "BONO" repeated 3 times in large white bold text
  * Some letters outlined, some solid, creating layered depth effect
- Pattern of small white dots in grid on left side
- Text within frame:
  * Bottom left: White quote icon + tagline "BE READY" or brand message
  * Placeholder text below in white font
  * Top right: Date and collection number in small accent color
- Small white plus signs and dot patterns scattered on orange background outside frame
- Typography: Bold condensed sans-serif, white with occasional red/cream accents

🚫 GARMENT RULE: The t-shirt/garment must NOT be altered - keep EXACTLY as reference image
""",
            "minimalist_editorial": f"""
{typography_base}

MINIMALIST EDITORIAL LAYOUT (High-End Magazine):
- Background: Clean off-white textured art paper (#F8F6F3)
- Model placed on RIGHT side of frame, back view
- LEFT side has elegant text block:
  * Large title in thin classic serif font (like Cormorant): "THE BACK PRINT STATEMENT" or collection headline
  * Below: Smaller clean sans-serif paragraph of description/placeholder text
  * A thin vertical black line separates text block from model
- Bottom left: Small caps text "COLLECTION 24 / LOOK 03" or similar
- Overall feel: Airy, premium, uncluttered, lots of white space
- Typography: Thin serif headlines, clean sans-serif body
- Color palette: Off-white, black, minimal accents

🚫 GARMENT RULE: The t-shirt/garment must NOT be altered - keep EXACTLY as reference image
""",
            "urban_brutalist": f"""
{typography_base}

URBAN BRUTALIST LAYOUT (Streetwear/Industrial):
- Background: Textured light gray concrete wall texture (#A0A0A0)
- Model positioned CENTRALLY, back view
- Behind model: Large DISTRESSED bold black sans-serif text "URBAN LEGEND" (partially obscured/weathered)
- Technical overlay elements:
  * Thin black grid lines across composition
  * Small crosshair target symbols
  * Rectangular data box (top right) with monospaced text: "SPEC: HVY COTTON / GFX: BEAR / ID: 4920"
- Bottom: Large bold condensed font "STREETWEAR"
- Color palette: STRICTLY monochrome (black, white, grays) - the product should POP as the only color
- Feel: Edgy, industrial, technical, modern streetwear

🚫 GARMENT RULE: The t-shirt/garment must NOT be altered - keep EXACTLY as reference image
""",
            "warm_earth": f"""
{typography_base}

WARM EARTH TONES LAYOUT (Organic/Natural):
- Background: Composed collage of overlapping soft-edged abstract shapes in warm earth tones:
  * Muted terracotta (#C68B77)
  * Sage green (#9CAF88)
  * Sand beige (#D4C4B0)
  * Dusty rose (#D4A5A5)
- Model placed slightly LEFT, back view
- RIGHT side: Flowing elegant serif headline "Natural Comfort" or similar
- Subtle line-art botanical illustrations (leaves, abstract branches) in dark brown integrated into background
- Bottom right: Small text block "Sustainable Essentials" or brand tagline
- Lighting: Soft and warm, sun-drenched feel
- Typography: Elegant flowing serif for headlines
- Feel: Organic, inviting, natural, warm

🚫 GARMENT RULE: The t-shirt/garment must NOT be altered - keep EXACTLY as reference image
""",
            "dark_luxury": f"""
{typography_base}

DARK MODE LUXURY LAYOUT (Premium/Dramatic):
- Background: Deep rich charcoal grey (#2C2C2C) with subtle smooth gradient lighting highlighting center
- Model positioned CENTER, back view
- The beige/cream garment should CONTRAST sharply with dark background
- Typography in METALLIC GOLD (#D4AF37):
  * Above model: Title "PREMIUM GRAPHICS" in reflective gold sans-serif
  * Below model: Thin gold horizontal line
  * Below line: Quote in smaller gold serif: "Details that define the look."
- Entire layout framed by thin gold border at page edge
- Feel: Luxurious, dramatic, high-contrast, premium
- Typography: Gold metallic effect on all text

🚫 GARMENT RULE: The t-shirt/garment must NOT be altered - keep EXACTLY as reference image
""",
            "dynamic_typography": f"""
{typography_base}

DYNAMIC TYPOGRAPHY OVERLAY LAYOUT (Modern/Energetic):
- Background: Clean white
- Model on RIGHT side, back view
- LEFT side dominating: HUGE translucent layered sans-serif text in light gray
  * Text reads "ORIGINAL DESIGN" arranged VERTICALLY
  * Should partially overlap model's left shoulder
- Top left corner: Bold black rectangular title block "THE NEW STANDARD"
- Accent color: Bright orange (#E67E22)
  * Small solid orange circle graphic in bottom left
  * Small text "Vol. 05" near title in orange
- Typography: Strong visual hierarchy, text as major design element
- Feel: Energetic, modern, design-heavy, bold

🚫 GARMENT RULE: The t-shirt/garment must NOT be altered - keep EXACTLY as reference image
""",
            "polaroid_pip": f"""
{typography_base}

POLAROID PICTURE-IN-PICTURE LAYOUT (Macro/Micro Hierarchy):
- BACKGROUND: Full-bleed ZOOMED-IN shot of garment back or fabric texture
  * Fill entire canvas with detailed fabric/print texture as immersive backdrop
  * This is NOT a model shot - zoom into the GARMENT DETAIL to create texture
  * Slightly desaturated or darker to serve as backdrop
  
- FOREGROUND: A "POLAROID CARD" floating in upper-right corner
  * White thick border (Polaroid/Instax style frame)
  * Inside the frame: Sharp, full-color model wearing the garment (front view)
  * Polaroid should be approximately 35-40% of canvas size
  * Slight rotation (5-8 degrees) for casual feel
  * Subtle drop shadow to lift it off background
  
- TEXT: Strictly INSIDE the white border of the Polaroid card
  * Brand name and headline in small elegant font within the white bottom border
  * Background remains completely clean of text

- Feel: Layered, editorial, macro vs micro contrast
- The Polaroid creates visual hierarchy - detail background, hero inset

🚫 GARMENT RULE: The garment in both background texture AND polaroid must match reference EXACTLY
""",
            "vertical_diptych": f"""
{typography_base}

50/50 VERTICAL DIPTYCH LAYOUT (Split-Screen Comparison):
- Canvas SPLIT EXACTLY DOWN THE MIDDLE VERTICALLY into two equal panes
- THIN WHITE GUTTER (2-4px) or hard line separating the two halves

- LEFT PANE (50%): Model wearing garment - FRONT VIEW
  * Full body, centered in left half
  * Clean studio background (white or light gray)
  
- RIGHT PANE (50%): Model wearing garment - BACK VIEW  
  * Full body, centered in right half
  * Same background and lighting as left pane for consistency

- BOTH models should be same person, same pose family (just front/back)
- Equal visual weight on both sides - this is about COMPARISON

- TYPOGRAPHY: 
  * Brand name centered at TOP, spanning both columns
  * Main headline centered at BOTTOM, spanning full width below both images
  * Clean, simple, lookbook style

- Feel: Clean, informative, lookbook clarity, front-vs-back showcase
- This is NOT an artistic poster - it's a practical comparison layout

🚫 GARMENT RULE: Garment must be IDENTICAL in both front and back views
""",
            "hero_sidebar_strip": f"""
{typography_base}

HERO WITH SIDEBAR STRIP LAYOUT (75/25 Split):
- HERO AREA (75-80% of canvas): Single large lifestyle shot
  * Full-body model shot filling the main area
  * Dynamic pose, editorial quality
  * This is the "vibe sell" - aspirational, beautiful
  
- SIDEBAR STRIP (20-25% of canvas): Narrow VERTICAL strip on RIGHT side
  * Contains 3-4 STACKED SQUARE THUMBNAILS
  * Each thumbnail is a zoomed-in detail shot:
    - Thumbnail 1: Fabric texture closeup
    - Thumbnail 2: Print/graphic detail
    - Thumbnail 3: Collar or neckline detail
    - Thumbnail 4: Hem or cuff detail
  * Small gaps between thumbnails
  * This is the "quality sell" - showing craftsmanship
  
- TYPOGRAPHY:
  * Headline in negative space of Hero (top or bottom)
  * Subtext below headline
  * Tagline at top of sidebar strip (rotated 90° optional)
  
- Feel: Hero sells emotion, strip sells quality details
- Magazine editorial with product focus strip

🚫 GARMENT RULE: The garment in hero AND all thumbnails must match reference EXACTLY
""",
            "scrapbook_stack": f"""
{typography_base}

OFFSET SCRAPBOOK STACK LAYOUT (Organic/Street):
- Background: Light textured surface (off-white, cream, or light gray - like a table or desk)

- TWO RECTANGULAR PHOTOS overlapping casually like thrown on a table:
  * BOTTOM PHOTO: Slightly FADED or GRAYSCALE/DESATURATED
    - Rotated approximately -8 to -12 degrees (tilted left)
    - Shows model back view or detail shot
    - Pushed back visually (lower contrast, slightly washed out)
    
  * TOP PHOTO: Full COLOR with DROP SHADOW
    - Rotated approximately +5 to +8 degrees (tilted right)  
    - Shows model front view, sharp and vibrant
    - Cast shadow on bottom photo to create depth
    - White polaroid-style border optional
    
- Photos should OVERLAP diagonally, offset from center

- TYPOGRAPHY:
  * Loose, organic placement - NOT rigid
  * Headline can OVERLAP corners of top photo
  * Brand text can be VERTICAL along edge of top photo
  * Handwritten-style or casual fonts work well
  
- Feel: Youthful, organic, street/urban aesthetic, casual cool
- Like someone arranged photos in a scrapbook

🚫 GARMENT RULE: Garment must match reference EXACTLY in both photos
""",
            "ghost_double_exposure": f"""
{typography_base}

GHOST DOUBLE EXPOSURE LAYOUT (Artistic Seamless Blend):
⚠️ THIS IS AN ARTISTIC DOUBLE-EXPOSURE COMPOSITE - NOT A SIMPLE POSTER

- BACKGROUND LAYER (Ghost/Phantom):
  * Large, DESATURATED BLACK-AND-WHITE or very LOW OPACITY (20-40%) image
  * Content: Either CLOSEUP OF MODEL'S FACE or ZOOMED GARMENT BACK PRINT
  * This layer fills the ENTIRE canvas edge-to-edge
  * It should feel ethereal, faded, ghostly - like a memory or shadow
  * NO hard borders or frames around this layer
  
- FOREGROUND LAYER (Sharp Cutout):
  * SHARP, FULL-COLOR cutout of model in DIFFERENT POSE
  * Full body shot, slightly offset from center
  * NO box, NO border, NO frame around the model
  * Model should appear to BLEND and MERGE with the ghost background
  * Edges can softly dissolve into the background layer
  
- The two layers should SEAMLESSLY BLEND - this is DOUBLE EXPOSURE photography
- Parts of the ghost layer should show THROUGH the darker areas of foreground

- TYPOGRAPHY (Sandwiched for 3D Depth):
  * LARGE, BOLD headline text placed BETWEEN the two layers
  * Text appears BEHIND the foreground model but IN FRONT OF the ghost background
  * This creates a visual "sandwich" with dimensionality:
    Back: Ghost layer → Middle: TEXT → Front: Color model cutout
  * Text can be semi-transparent or have blend mode effect
  * Use dramatic fonts: Bebas Neue, Impact, or bold condensed

- Feel: Artistic, dreamlike, 3D depth, fashion editorial, avant-garde
- Think: High-fashion magazine double exposure photography

🚫 GARMENT RULE: Garment in foreground model MUST match reference EXACTLY
""",
            "typographic_gutter": f"""
{typography_base}

TYPOGRAPHIC GUTTER SPLIT LAYOUT (Text as Structure):
- The canvas is DIVIDED by a THICK BAND OF TYPOGRAPHY (not a thin line)

OPTION A - HORIZONTAL GUTTER:
  * TOP HALF: Image of model (front view or lifestyle)
  * MIDDLE: THICK HORIZONTAL TEXT BAND (15-20% of canvas height)
    - Contains BRAND NAME or COLLECTION TITLE in BOLD, LARGE font
    - Text fills the entire band, becomes the visual divider
  * BOTTOM HALF: Image of model (back view or different angle)

OPTION B - VERTICAL GUTTER:
  * LEFT HALF: Image of model
  * CENTER: VERTICAL TEXT BAND running top to bottom
    - Brand name written vertically in bold condensed font
  * RIGHT HALF: Second image of model or detail

- The TEXT ITSELF is the FRAME and STRUCTURE of the page
- Text should be IMPACTFUL: 100+ pt, bold, condensed fonts
- Color contrast: If images are dark, text band is light (and vice versa)

- Feel: Very modern, high-impact, forces viewer to read as eyes move between images
- The typography is NOT decoration - it IS the architecture

- Additional text (subtext, tagline) can appear WITHIN the text band
- Think: Bold experimental magazine layouts

🚫 GARMENT RULE: Garment in both images MUST match reference EXACTLY
"""
        }
        
        return layouts.get(layout_style, layouts["hero_bottom"])
    
    def _build_text_instructions(self, layout_style: str, text_content: dict) -> str:
        """Build text placement instructions based on layout and content"""
        
        headline = text_content.get("headline", "")
        subtext = text_content.get("subtext", "")
        brand = text_content.get("brand", "")
        price = text_content.get("price", "")
        cta = text_content.get("cta", "")
        tagline = text_content.get("tagline", "")
        
        instructions = []
        
        if headline:
            instructions.append(f'HEADLINE TEXT: "{headline}" - Large, bold, prominent')
        if subtext:
            instructions.append(f'SUBTEXT: "{subtext}" - Smaller, below headline')
        if brand:
            instructions.append(f'BRAND/LOGO TEXT: "{brand}" - Clean, professional')
        if price:
            instructions.append(f'PRICE: "{price}" - Bold, easy to read')
        if cta:
            instructions.append(f'CALL TO ACTION: "{cta}" - Prominent, action-oriented')
        if tagline:
            instructions.append(f'TAGLINE: "{tagline}" - Elegant, subtle')
        
        if not instructions:
            return "No text overlay needed. Create a clean image suitable for post-production text addition."
        
        return "\n".join(instructions)

    # ============================================
    # MASTER CATALOG GENERATION
    # ============================================

    async def generate_catalog_cover(
        self,
        logo_image: Optional[bytes],
        collection_name: str,
        collection_number: str,
        theme: str,
        text_content: dict
    ) -> bytes:
        """Generate a stunning catalog cover page (no model, just branding)"""
        
        theme_config = THEME_CONFIG.get(theme, THEME_CONFIG["studio_minimal"])
        
        # Build text info
        text_lines = []
        if text_content.get("tagline"):
            text_lines.append(f'Tagline: "{text_content["tagline"]}"')
        if text_content.get("season"):
            text_lines.append(f'Season: "{text_content["season"]}"')
        if text_content.get("year"):
            text_lines.append(f'Year: "{text_content["year"]}"')
        if text_content.get("brand_message"):
            text_lines.append(f'Message: "{text_content["brand_message"]}"')
        
        additional_text = "\n".join(text_lines) if text_lines else "No additional text"
        
        prompt = f"""You are a world-class Graphic Designer and Art Director.
Generate a STUNNING CATALOG COVER PAGE for a fashion collection.

=== THIS IS A COVER PAGE - NO MODEL ===
DO NOT include any person or model in this image.
This is purely a branding/title page for the catalog.

=== COLLECTION INFO ===
Collection Name: "{collection_name}"
Collection Number: "{collection_number}"

=== TYPOGRAPHY ===
- Collection name should be LARGE and PROMINENT
- Use elegant, high-end fashion typography
- Collection number styled as secondary element
{additional_text}

=== DESIGN ===
Background Style: {theme_config['background_desc']}
Mood: {theme_config['mood']}
Lighting: {theme_config['lighting']}

- Create a luxurious, high-end catalog cover
- Professional fashion brand aesthetic
- The page should feel COMPLETE and PREMIUM
- DO NOT leave the page looking empty
- Use decorative elements, patterns, or color blocks to fill space
- Center the text elements beautifully

=== TECHNICAL ===
- Resolution: 2K, print-ready
- Aspect ratio: 9:16 vertical
- Sharp, clean design

Generate an elegant catalog cover page."""

        contents = [prompt]
        
        if logo_image:
            logo_pil = self._image_to_pil(logo_image)
            contents.append(logo_pil)
            contents.append("Include this logo prominently in the design, at the top or center.")
        
        for attempt, model_to_use in enumerate([self.PRIMARY_MODEL, self.FALLBACK_MODEL]):
            try:
                print(f"Generating cover with {model_to_use} (attempt {attempt + 1})")
                
                response = await asyncio.to_thread(
                    self.client.models.generate_content,
                    model=model_to_use,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE"],
                        image_config=types.ImageConfig(
                            aspect_ratio="9:16",
                            image_size=image_quality if model_to_use == self.PRIMARY_MODEL else None
                        )
                    )
                )
                
                return self._extract_image_from_response(response)
                
            except Exception as e:
                print(f"Model {model_to_use} failed: {e}")
                if attempt == 1:
                    raise
                print("Retrying with fallback...")
        
        raise ValueError("All models failed")

    async def generate_catalog_thankyou(
        self,
        logo_image: Optional[bytes],
        collection_name: str,
        theme: str,
        product_images: list,
        contact_info: dict
    ) -> bytes:
        """Generate a thank you page with product collage and contact info"""
        
        theme_config = THEME_CONFIG.get(theme, THEME_CONFIG["studio_minimal"])
        
        # Format contact info
        contact_text = f"""
Contact Details:
- Company: {contact_info.get('company', '')}
- Email: {contact_info.get('email', '')}
- Phone: {contact_info.get('phone', '')}
- Website: {contact_info.get('website', '')}
- Address: {contact_info.get('address', '')}
"""
        
        prompt = f"""You are a world-class Graphic Designer and Art Director.
Generate a THANK YOU PAGE for a fashion catalog.

=== PAGE PURPOSE ===
This is the FINAL page of a fashion catalog.
Include "Thank You" message and contact information.

=== CONTENT TO INCLUDE ===
1. Large "THANK YOU" or "Thank You for Viewing" message
2. Collection name: "{collection_name}"
3. Contact information (display elegantly):
{contact_text}

=== LAYOUT ===
- "Thank You" message prominent at top
- Small collage/grid preview of products in middle (if product images provided)
- Contact details at bottom, professionally formatted
- Logo if provided

=== DESIGN ===
Background Style: {theme_config['background_desc']}
Mood: {theme_config['mood']}

- Elegant, professional closing page
- Consistent with catalog branding
- The page should look COMPLETE and FINISHED
- Use decorative elements to create visual interest

=== TECHNICAL ===
- Resolution: 2K, print-ready
- Aspect ratio: 9:16 vertical

Generate a beautiful catalog closing page."""

        contents = [prompt]
        
        if logo_image:
            logo_pil = self._image_to_pil(logo_image)
            contents.append(logo_pil)
            contents.append("Include this logo in the design.")
        
        # Add a few product images for the collage (max 4)
        for i, img in enumerate(product_images[:4]):
            product_pil = self._image_to_pil(img)
            contents.append(product_pil)
            contents.append(f"Product {i+1} for collage preview")
        
        for attempt, model_to_use in enumerate([self.PRIMARY_MODEL, self.FALLBACK_MODEL]):
            try:
                print(f"Generating thank you page with {model_to_use} (attempt {attempt + 1})")
                
                response = await asyncio.to_thread(
                    self.client.models.generate_content,
                    model=model_to_use,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE"],
                        image_config=types.ImageConfig(
                            aspect_ratio="9:16",
                            image_size=image_quality if model_to_use == self.PRIMARY_MODEL else None
                        )
                    )
                )
                
                return self._extract_image_from_response(response)
                
            except Exception as e:
                print(f"Model {model_to_use} failed: {e}")
                if attempt == 1:
                    raise
                print("Retrying with fallback...")
        
        raise ValueError("All models failed")

    # ============================================
    # ENHANCED CATALOG GENERATION METHODS
    # ============================================

    async def generate_combo_layout(
        self,
        front_image: bytes,
        back_image: bytes,
        logo_image: Optional[bytes],
        category: str,
        skin_tone: str = "fair",
        body_type: str = "",
        theme: str = "studio_minimal",
        collection_name: str = "",
        image_quality: str = "4K"
    ) -> bytes:
        """Generate a combo layout with front AND back views in one image"""
        
        config = MODEL_CONFIG.get(category, MODEL_CONFIG["teen_boy"])
        skin_desc = SKIN_TONES.get(skin_tone, SKIN_TONES.get("fair", skin_tone))
        theme_config = THEME_CONFIG.get(theme, THEME_CONFIG["studio_minimal"])
        build = body_type if body_type else config["default_build"]
        
        prompt = f"""You are a world-class Fashion Photographer creating a COMBO LAYOUT poster.

=== LAYOUT REQUIREMENT ===
Create a SINGLE image showing the SAME model TWICE:
- LEFT SIDE: Model wearing the garment (FRONT view)
- RIGHT SIDE: Same model wearing the garment (BACK view)

The image should be SPLIT VERTICALLY with a subtle divider or gradient transition.
Both views should show the FULL BODY (head to toe).

=== MODEL CONSISTENCY (CRITICAL) ===
Both the front and back views MUST show the EXACT SAME model:
- Same face, hair, skin tone, body type
- Same height and proportions
- Only difference is the viewing angle (front vs back)

=== MODEL DETAILS ===
- Description: {config['description']}, {config['age_range']}
- Skin: {skin_desc}
- Build: {build}
- Expression: Natural, confident

=== GARMENT PRESERVATION (CRITICAL) ===
⛔ DO NOT modify, alter, or add anything to the garments
✅ Copy EXACTLY what's shown in the reference images
✅ Front garment image shows the FRONT of the product
✅ Back garment image shows the BACK of the product

=== DESIGN ===
- Background: {theme_config['background_desc']}
- Lighting: {theme_config['lighting']}
- Mood: {theme_config['mood']}
- Brand text at top or bottom: "{collection_name}" (use Montserrat font, elegant)

=== TECHNICAL ===
- Aspect ratio: 9:16 vertical
- Resolution: {image_quality}
- Both models equal size, professional catalog quality

Generate the combo front+back layout now."""

        front_pil = self._image_to_pil(front_image)
        back_pil = self._image_to_pil(back_image)
        
        contents = [prompt, front_pil, "This is the FRONT view of the garment", back_pil, "This is the BACK view of the garment"]
        
        if logo_image:
            logo_pil = self._image_to_pil(logo_image)
            contents.extend([logo_pil, "Include this logo subtly in the design"])
        
        for attempt, model_to_use in enumerate([self.PRIMARY_MODEL, self.FALLBACK_MODEL]):
            try:
                print(f"Generating combo layout with {model_to_use} (attempt {attempt + 1})")
                
                response = await self._generate_with_timeout(
                    model=model_to_use,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE"],
                        image_config=types.ImageConfig(
                            aspect_ratio="9:16",
                            image_size=image_quality if model_to_use == self.PRIMARY_MODEL else None
                        )
                    )
                )
                
                return self._extract_image_from_response(response)
                
            except Exception as e:
                print(f"Model {model_to_use} failed: {e}")
                if attempt == 1:
                    raise
                print("Retrying with fallback...")
        
        raise ValueError("All models failed")

    async def generate_fabric_closeup(
        self,
        garment_image: bytes,
        theme: str = "studio_minimal",
        collection_name: str = "",
        fabric_description: str = "",
        image_quality: str = "4K"
    ) -> bytes:
        """Generate an AI close-up of fabric texture (no model)"""
        
        theme_config = THEME_CONFIG.get(theme, THEME_CONFIG["studio_minimal"])
        
        fabric_info = f'Fabric: "{fabric_description}"' if fabric_description else "Study the fabric texture from the reference"
        
        prompt = f"""You are an elite, world-renowned Fashion Product Photographer and Textile Specialist. Your work is featured in premium print editorials like Vogue, Kinfolk, and architectural digests.

=== OBJECTIVE ===
Create a hyper-realistic, extremely detailed MACRO CLOSE-UP photograph showcasing the rich fabric quality, texture, and weave of the reference garment.
This is a pure material and texture focus shot.
🚫 NO MODELS, NO FACES, NO HUMAN BODIES. ONLY the premium fabric itself, draped or folded artistically.

=== FABRIC DESCRIPTION ===
{fabric_info}

=== PHOTO COMPOSITION & DRAPING ===
- Focus: Macro close-up filling 85% of the frame.
- Draping: The fabric should drape elegantly with organic, soft folds, ripples, and curves that catch the light, highlighting its weight, thickness, and hand-feel.
- Depth of Field: Shallow depth of field. The central fold/weave must be in razor-sharp focus (showing tiny fibers and individual threads), while the foreground and background gently fall into a beautiful, buttery bokeh blur.
- Styling: Show the natural, luxurious fall of the fabric. It can drape over a minimal, organic surface like a curved raw plaster block, a matte concrete ledge, or a smooth beige travertine stone.

=== LIGHTING & COLOR ===
- Lighting: Low-contrast, cinematic, directional side-lighting (like golden hour sun coming through a studio window, or soft diffused beauty studio key lighting). This side-lighting must highlight the raised micro-textures, thread patterns, and weave details.
- Colors: Must match the reference garment's color EXACTLY. If the garment is cream, the close-up must be cream.
- Shadows: Soft, gradual, atmospheric shadows that give depth and three-dimensionality to the folds.

=== AESTHETIC & MOOD ===
- Style: Minimalist luxury, organic modernism, tactile and premium.
- Muted branding: In the bottom corner, add a subtle, elegant text overlay: "{collection_name}" in a clean, small Montserrat font.

=== TECHNICAL ===
- Aspect ratio: 9:16 vertical
- Resolution: {image_quality}
- Lens: 100mm Macro lens style, f/2.8 aperture feel, ultra-sharp detail capture.
- CRITICAL: Recreate the fabric texture from the reference image with absolute high fidelity. Do not invent unrelated textures (e.g. do not show leather if reference is cotton knit).

Generate the cinematic fabric close-up now."""

        garment_pil = self._image_to_pil(garment_image)
        contents = [prompt, garment_pil, "Study this garment's fabric closely and recreate the texture"]
        
        for attempt, model_to_use in enumerate([self.PRIMARY_MODEL, self.FALLBACK_MODEL]):
            try:
                print(f"Generating fabric closeup with {model_to_use} (attempt {attempt + 1})")
                
                response = await self._generate_with_timeout(
                    model=model_to_use,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE"],
                        image_config=types.ImageConfig(
                            aspect_ratio="9:16",
                            image_size=image_quality if model_to_use == self.PRIMARY_MODEL else None
                        )
                    )
                )
                
                return self._extract_image_from_response(response)
                
            except Exception as e:
                print(f"Model {model_to_use} failed: {e}")
                if attempt == 1:
                    raise
                print("Retrying with fallback...")
        
        raise ValueError("All models failed")

    async def generate_detail_highlight(
        self,
        garment_image: bytes,
        theme: str = "studio_minimal",
        collection_name: str = "",
        image_quality: str = "4K"
    ) -> bytes:
        """Generate a focus shot on the highlight element (embroidery, print, etc.) - no model"""
        
        theme_config = THEME_CONFIG.get(theme, THEME_CONFIG["studio_minimal"])
        
        prompt = f"""You are a luxury fashion campaign photographer. Your signature style is creating highly dramatic, cinematic detail shots for premium streetwear and high-fashion catalogs.

=== OBJECTIVE ===
Identify the SINGLE most distinctive and interesting design element (the "Hero feature") on the reference garment—such as a graphic print, custom embroidery, heavy stitching, metal zipper, woven patch, unique collar/neckline, or premium hardware—and create a high-contrast, cinematic detail shot showcasing it.
This is a detail and craftsmanship focus shot.
🚫 NO MODELS, NO FACES, NO HUMAN BODIES. ONLY the garment flat lay or draped naturally.

=== COMPOSITION & STYLE ===
- Focus: Angle the shot so that the Hero design element (e.g. print/embroidery/accessory) is front-and-center, taking up 60-70% of the frame.
- Depth of Field: Use a shallow f/2.2 depth of field. The main graphic or hardware should be in ultra-sharp focus, showing the fine thread weave, print ink texture, or metal reflection, while the rest of the garment and background melt into a smooth, creamy blur.
- Styling: Show the garment draped naturally or laid flat on an artistic, minimal background: {theme_config['background_desc']}.
- Branding: Add a clean, extremely subtle text overlay in the bottom corner reading: "{collection_name}" in a modern Montserrat font.

=== LIGHTING & COLOR ===
- Lighting: Dramatic, high-contrast lighting that chisels the textures. Use crisp directional light to cast subtle shadows that emphasize the texture of the embroidery or print.
- Colors: Ensure the colors of the graphic print, embroidery, or fabric match the reference garment EXACTLY.

=== TECHNICAL ===
- Aspect ratio: 9:16 vertical
- Resolution: {image_quality}
- Lens: 85mm prime lens feel, capturing high-fidelity textures.
- CRITICAL: Preserve the exact visual style, colors, and graphics of the reference garment's design highlight. Do not invent new logos or graphics.

Generate the cinematic hero detail highlight now."""

        garment_pil = self._image_to_pil(garment_image)
        contents = [prompt, garment_pil, "Identify and highlight the main design element of this garment"]
        
        for attempt, model_to_use in enumerate([self.PRIMARY_MODEL, self.FALLBACK_MODEL]):
            try:
                print(f"Generating detail highlight with {model_to_use} (attempt {attempt + 1})")
                
                response = await self._generate_with_timeout(
                    model=model_to_use,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE"],
                        image_config=types.ImageConfig(
                            aspect_ratio="9:16",
                            image_size=image_quality if model_to_use == self.PRIMARY_MODEL else None
                        )
                    )
                )
                
                return self._extract_image_from_response(response)
                
            except Exception as e:
                print(f"Model {model_to_use} failed: {e}")
                if attempt == 1:
                    raise
                print("Retrying with fallback...")
        
        raise ValueError("All models failed")

    async def generate_model_with_callout(
        self,
        garment_image: bytes,
        logo_image: Optional[bytes],
        category: str,
        skin_tone: str = "fair",
        body_type: str = "",
        theme: str = "studio_minimal",
        collection_name: str = "",
        view: str = "front",
        image_quality: str = "4K"
    ) -> bytes:
        """Generate model wearing garment WITH zoomed inset showing detail"""
        
        config = MODEL_CONFIG.get(category, MODEL_CONFIG["teen_boy"])
        skin_desc = SKIN_TONES.get(skin_tone, SKIN_TONES.get("fair", skin_tone))
        theme_config = THEME_CONFIG.get(theme, THEME_CONFIG["studio_minimal"])
        build = body_type if body_type else config["default_build"]
        
        prompt = f"""You are a world-class Fashion Photographer creating a MODEL + DETAIL CALLOUT layout.

=== LAYOUT REQUIREMENT ===
Create a SINGLE image with TWO elements:
1. MAIN IMAGE: Full-body model wearing the garment ({view} view) - takes 75% of the space
2. CALLOUT INSET: Zoomed circle or rounded rectangle showing a close-up of the garment's key detail

=== CALLOUT DESIGN ===
- Position the callout in a corner (bottom-right or top-right preferred)
- Draw a thin line connecting the callout to the relevant area on the model
- The callout shows: embroidery detail, print close-up, fabric texture, or logo
- Make it look like a "zoom bubble" or "magnifier" effect

=== MODEL DETAILS ===
- Description: {config['description']}, {config['age_range']}
- Skin: {skin_desc}
- Build: {build}
- Pose: Editorial, confident, showing off the garment
- View: {view} view

=== GARMENT PRESERVATION (CRITICAL) ===
⛔ DO NOT modify the garment in any way
✅ Copy EXACTLY what's shown in the reference image
✅ The callout must show a real detail from the same garment

=== DESIGN ===
- Background: {theme_config['background_desc']}
- Lighting: {theme_config['lighting']}
- Mood: {theme_config['mood']}
- Brand: "{collection_name}" in Montserrat font (subtle placement)

=== TECHNICAL ===
- Aspect ratio: 9:16 vertical
- Resolution: {image_quality}
- The callout should be clearly visible but not overwhelming

Generate the model + callout layout now."""

        garment_pil = self._image_to_pil(garment_image)
        contents = [prompt, garment_pil, "Use this garment on the model and show a detail callout"]
        
        if logo_image:
            logo_pil = self._image_to_pil(logo_image)
            contents.extend([logo_pil, "Include this logo in the design"])
        
        for attempt, model_to_use in enumerate([self.PRIMARY_MODEL, self.FALLBACK_MODEL]):
            try:
                print(f"Generating model + callout with {model_to_use} (attempt {attempt + 1})")
                
                response = await self._generate_with_timeout(
                    model=model_to_use,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE"],
                        image_config=types.ImageConfig(
                            aspect_ratio="9:16",
                            image_size=image_quality if model_to_use == self.PRIMARY_MODEL else None
                        )
                    )
                )
                
                return self._extract_image_from_response(response)
                
            except Exception as e:
                print(f"Model {model_to_use} failed: {e}")
                if attempt == 1:
                    raise
                print("Retrying with fallback...")
        
        raise ValueError("All models failed")

    async def generate_catalog_cover_enhanced(
        self,
        logo_image: Optional[bytes],
        collection_name: str,
        style_number: str,
        theme: str,
        image_quality: str = "4K"
    ) -> bytes:
        """Generate a premium, minimalist catalog cover - typography focused"""
        
        theme_config = THEME_CONFIG.get(theme, THEME_CONFIG["studio_minimal"])
        
        prompt = f"""You are an award-winning Editorial Art Director at Condé Nast creating a LUXURY FASHION CATALOG COVER.

=== CRITICAL: THIS IS A COVER PAGE ===
- NO models, NO people, NO faces, NO hands
- This is PURELY a typographic title page
- Think: Vogue, Harper's Bazaar, Architectural Digest level quality

=== DESIGN DIRECTION ===
Create an ULTRA-PREMIUM, MINIMALIST cover with these elements:

TYPOGRAPHY (THE HERO):
- Collection Name: "{collection_name}"
  → Use a refined serif font (Playfair Display, Cormorant Garamond style)
  → OR elegant sans-serif (Montserrat Thin, Helvetica Neue Light)
  → LARGE, centered, with generous letter-spacing
  → The typography should be ART, not just text

- Style/Collection Number: "{style_number}"
  → Much smaller, elegant, understated
  → Positioned subtly below collection name
  → Use lighter weight of same font family

BACKGROUND TREATMENT:
- Create a sophisticated, MUTED background
- Options (pick one that feels premium):
  → Soft gradient (champagne to cream, or charcoal to black)
  → Subtle marble or paper texture
  → Delicate abstract shapes in low opacity
  → Elegant bokeh or soft light leak effect
- Theme inspiration: {theme_config['mood']}
- The background should NEVER overpower the typography

COLOR PALETTE:
- Use REFINED, MUTED tones only
- Suggested: Ivory, charcoal, champagne gold, deep navy, soft blush
- NO bright or neon colors
- Text should have subtle contrast with background

LAYOUT PRINCIPLES:
- EXTREME minimalism - less is more
- Perfect vertical centering
- Generous white space (60%+ should be breathing room)
- Asymmetry is allowed if elegant
- Think: Japanese design, Scandinavian minimalism

AVOID (CRITICAL):
❌ NO logos or brand marks
❌ NO decorative ornaments or flourishes
❌ NO patterns that distract from text
❌ NO gradients that look cheap or digital
❌ NO stock photo backgrounds
❌ NO clipart or generic design elements

=== QUALITY ===
- Resolution: {image_quality}
- Aspect ratio: 9:16 vertical
- This should look like it belongs in a print portfolio

Generate a cover that would make fashion editors jealous."""

        contents = [prompt]
        # Intentionally NOT adding logo to contents
        
        for attempt, model_to_use in enumerate([self.PRIMARY_MODEL, self.FALLBACK_MODEL]):
            try:
                print(f"Generating premium cover with {model_to_use} (attempt {attempt + 1})")
                
                response = await self._generate_with_timeout(
                    model=model_to_use,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE"],
                        image_config=types.ImageConfig(
                            aspect_ratio="9:16",
                            image_size=image_quality if model_to_use == self.PRIMARY_MODEL else None
                        )
                    )
                )
                
                return self._extract_image_from_response(response)
                
            except Exception as e:
                print(f"Model {model_to_use} failed: {e}")
                if attempt == 1:
                    raise
                print("Retrying with fallback...")
        
        raise ValueError("All models failed")

    async def generate_catalog_thankyou_simple(
        self,
        logo_image: Optional[bytes],
        collection_name: str,
        theme: str,
        image_quality: str = "4K"
    ) -> bytes:
        """Generate a minimal, elegant Thank You page"""
        
        theme_config = THEME_CONFIG.get(theme, THEME_CONFIG["studio_minimal"])
        
        prompt = f"""You are an Editorial Art Director creating an ELEGANT CATALOG CLOSING PAGE.

=== CRITICAL: THIS IS A CLOSING PAGE ===
- NO models, NO people, NO faces, NO hands
- This should feel like a graceful, quiet ending
- Think: Credits of an art film, final page of a coffee table book

=== DESIGN DIRECTION ===
Create an ULTRA-MINIMAL closing page:

TYPOGRAPHY:
- Primary text: "Thank You" OR "Merci" OR simply the collection name
  → Use refined, elegant typography
  → Can be serif (Cormorant, Playfair) or thin sans-serif
  → Graceful, understated, NOT bold
  → Perfect kerning and letter-spacing

- Optional secondary text: "{collection_name}"
  → Very subtle, much smaller
  → If included, position elegantly below primary text

BACKGROUND:
- EXTREMELY minimal and quiet
- Options:
  → Solid muted color (cream, charcoal, blush, sage)
  → Very subtle gradient (barely perceptible)
  → Delicate paper texture
- Theme mood: {theme_config['mood']}
- The background should WHISPER, not speak

LAYOUT:
- Perfect centering or elegant asymmetric placement
- MAXIMUM white space (70%+ should be empty)
- One or two elements only
- Think: The visual equivalent of a soft exhale

AVOID (CRITICAL):
❌ NO logos or brand marks
❌ NO decorative elements
❌ NO patterns or textures that distract
❌ NO social media handles or contact info
❌ NO generic "follow us" or CTA text
❌ NO clipart, icons, or illustrations

=== QUALITY ===
- Resolution: {image_quality}
- Aspect ratio: 9:16 vertical
- This should be museum-worthy in its simplicity

Generate a closing page that leaves the viewer with a sense of quiet satisfaction."""

        contents = [prompt]
        # Intentionally NOT adding logo
        
        for attempt, model_to_use in enumerate([self.PRIMARY_MODEL, self.FALLBACK_MODEL]):
            try:
                print(f"Generating thank you page with {model_to_use} (attempt {attempt + 1})")
                
                response = await self._generate_with_timeout(
                    model=model_to_use,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE"],
                        image_config=types.ImageConfig(
                            aspect_ratio="9:16",
                            image_size=image_quality if model_to_use == self.PRIMARY_MODEL else None
                        )
                    )
                )
                
                return self._extract_image_from_response(response)
                
            except Exception as e:
                print(f"Model {model_to_use} failed: {e}")
                if attempt == 1:
                    raise
                print("Retrying with fallback...")
        
        raise ValueError("All models failed")

    async def generate_catalog_product_page_v2(
        self,
        garment_image: bytes,
        category: str,
        view: Literal["front", "back"],
        skin_tone: str = "fair",
        body_type: str = "",
        theme: str = "studio_minimal",
        page_number: int = 1,
        total_pages: int = 10,
        image_quality: str = "4K"
    ) -> bytes:
        """
        Generate enhanced catalog product page with:
        - Strict garment preservation
        - No brand name overlay (only cover has that)
        - AI-generated creative phrase
        - Magazine-style varied layouts
        - Continuity in theme but unique compositions
        """
        
        # Check cache first
        cache_key = self._get_cache_key(
            "product_page_v2", garment_image, category, view, 
            skin_tone, body_type, theme, page_number, image_quality
        )
        cached = self._get_cached_image(cache_key)
        if cached:
            return cached
        
        config = MODEL_CONFIG.get(category, MODEL_CONFIG["teen_boy"])
        skin_desc = SKIN_TONES.get(skin_tone, SKIN_TONES.get("fair", skin_tone))
        theme_config = THEME_CONFIG.get(theme, THEME_CONFIG["studio_minimal"])
        build = body_type if body_type else config["default_build"]
        
        # Select a unique layout based on page number for variety
        layout = CATALOG_LAYOUT_STYLES[page_number % len(CATALOG_LAYOUT_STYLES)]
        
        # Select a unique creative phrase
        phrase = CREATIVE_PHRASES[(page_number * 3) % len(CREATIVE_PHRASES)]
        
        # Vary the pose based on page number for uniqueness
        pose_options = ["catalog_standard", "hands_in_pockets", "one_hand_pocket", 
                       "three_quarter", "hands_on_hips", "arms_crossed"]
        selected_pose = pose_options[page_number % len(pose_options)]
        pose_desc = POSE_TYPES.get(selected_pose, POSE_TYPES["catalog_standard"])
        
        prompt = f"""You are a world-class Fashion Photographer creating a PREMIUM CATALOG PAGE.

{STRICT_GARMENT_RULES}

═══════════════════════════════════════════════════════════════════════════
PAGE {page_number} OF {total_pages} - {view.upper()} VIEW
═══════════════════════════════════════════════════════════════════════════

=== LAYOUT STYLE: {layout['name'].upper()} ===
{layout['description']}
- Model position: {layout['model_position']}
- Text placement: {layout['text_position']}

=== MODEL DETAILS ===
- Subject: {config['description']}, {config['age_range']}
- Skin: {skin_desc}
- Build: {build}
- Pose: {pose_desc}
- View: {view} view of the garment

=== CRITICAL: NATURAL, REALISTIC HUMAN APPEARANCE ===
The model MUST look like a REAL HUMAN photographed with a DSLR camera:
- IMPERFECT SKIN: Natural pores, subtle texture, not airbrushed or plastic
- NATURAL HAIR: Slight flyaways, realistic texture, not CGI-perfect
- GENUINE EXPRESSION: Relaxed, authentic, like a candid moment between takes
- REAL EYES: Natural catchlights, slight imperfections, not perfectly symmetrical
- NATURAL POSE: Relaxed, not stiff or overly posed; weight shifted naturally
- HUMAN PROPORTIONS: Realistic body proportions, no uncanny valley effects

AVOID (CRITICAL):
❌ Waxy, plastic, or overly smooth skin
❌ Hair that looks like a wig or CGI
❌ Robotic or stiff poses
❌ Eyes that look dead or artificial
❌ Perfect symmetry that looks unnatural
❌ Overly retouched beauty campaign look

REFERENCE STYLE: Think candid shots from Acne Studios, Our Legacy, or The Row lookbooks
- Real models in natural poses
- Shot on film or high-end digital with minimal retouching
- Fashion editorial, not beauty advertisement

=== CREATIVE PHRASE (SMALL, SUBTLE) ===
Include this short phrase in elegant typography:
"{phrase}"
- Font: Thin, elegant sans-serif (like Montserrat Light)
- Size: Small, NOT overwhelming
- Position: {layout['text_position']}
- Color: Subtle, matches theme (white, cream, or muted)
- DO NOT add collection name or brand name - ONLY this phrase

=== DESIGN & THEME ===
- Background: {theme_config['background_desc']}
- Lighting: {theme_config['lighting']}
- Mood: {theme_config['mood']}
- Feel: Editorial fashion photography (Dazed, i-D, Another Magazine quality)

=== PHOTOGRAPHY STYLE ===
Shoot in the style of high-end editorial photography:
- Natural, diffused lighting (not harsh studio flash)
- Shallow depth of field for cinematic feel
- Muted, refined color grading (not oversaturated)
- Composition that feels intentional but not forced
- Think: Juergen Teller, Glen Luchford, Collier Schorr

=== LAYOUT & COMPOSITION ===
Layout: {layout['name'].upper()}
{layout['description']}
- Model position: {layout['model_position']}
- Text placement: {layout['text_position']}
- The composition should feel EDITORIAL, not commercial

=== TECHNICAL ===
- Aspect ratio: 9:16 vertical
- Resolution: {image_quality}
- Professional fashion photography quality

Generate this premium editorial catalog page now."""

        garment_pil = self._image_to_pil(garment_image)
        contents = [
            prompt, 
            garment_pil, 
            f"This is the {view} view of the garment. Copy it EXACTLY onto the model."
        ]
        
        for attempt, model_to_use in enumerate([self.PRIMARY_MODEL, self.FALLBACK_MODEL]):
            try:
                print(f"Generating catalog page V2 ({view}) with {model_to_use} (attempt {attempt + 1})")
                
                response = await self._generate_with_timeout(
                    model=model_to_use,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE"],
                        image_config=types.ImageConfig(
                            aspect_ratio="9:16",
                            image_size=image_quality if model_to_use == self.PRIMARY_MODEL else None
                        )
                    )
                )
                
                result = self._extract_image_from_response(response)
                self._cache_image(cache_key, result)  # Save to cache
                return result
                
            except Exception as e:
                print(f"Model {model_to_use} failed: {e}")
                if attempt == 1:
                    raise
                print("Retrying with fallback...")
        
        raise ValueError("All models failed")

    async def generate_fabric_closeup_v2(
        self,
        garment_image: bytes,
        theme: str = "studio_minimal",
        page_number: int = 1,
        image_quality: str = "4K"
    ) -> bytes:
        """
        Generate enhanced artistic fabric close-up (no model, no brand text)
        - Macro photography style
        - Artistic lighting and composition
        - Creative phrase overlay
        """
        
        # Check cache first
        cache_key = self._get_cache_key(
            "fabric_v2", garment_image, theme, page_number, image_quality
        )
        cached = self._get_cached_image(cache_key)
        if cached:
            return cached
        
        theme_config = THEME_CONFIG.get(theme, THEME_CONFIG["studio_minimal"])
        phrase = CREATIVE_PHRASES[(page_number * 5 + 7) % len(CREATIVE_PHRASES)]
        
        prompt = f"""You are a world-class Macro Photographer specializing in TEXTILE ARTISTRY.

=== TASK: ARTISTIC FABRIC CLOSE-UP ===
Create a STUNNING macro close-up photograph of the fabric from the reference garment.
NO MODEL in this image - just the fabric in an artistic composition.

=== ARTISTIC DIRECTION ===
This is NOT a simple product shot. This is TEXTILE ART.

COMPOSITION IDEAS (pick one):
- Dramatic fabric folds with deep shadows and highlights
- Soft draping with gentle curves, shot from an angle
- Extreme close-up showing individual threads/weave
- Fabric corner with beautiful lighting gradient
- Rippling texture with motion-like feel

LIGHTING:
- Soft, directional side lighting
- Creates depth and texture visibility
- Subtle shadows in fabric folds
- Gentle highlights on raised areas

DEPTH OF FIELD:
- Shallow depth of field for artistic feel
- Sharp focus on center of interest
- Beautiful soft bokeh on edges

=== FROM THE REFERENCE ===
Study the fabric in the reference image:
- Match the EXACT color of the fabric
- Match the EXACT texture (cotton, polyester, ribbed, smooth, etc.)
- If there are any patterns, show a partial glimpse

=== CREATIVE PHRASE ===
Small, elegant text: "{phrase}"
- Very subtle, corner placement
- Thin elegant font
- Does NOT distract from the fabric beauty

=== THEME MATCHING ===
Background elements: {theme_config['background_desc']}
Overall mood: {theme_config['mood']}

=== TECHNICAL ===
- Aspect ratio: 9:16 vertical
- Resolution: {image_quality}
- Macro photography quality
- NO brand names, NO collection text

Generate this artistic fabric photograph now."""

        garment_pil = self._image_to_pil(garment_image)
        contents = [
            prompt, 
            garment_pil, 
            "Study this garment's fabric - texture, color, weave - and create an artistic macro shot."
        ]
        
        for attempt, model_to_use in enumerate([self.PRIMARY_MODEL, self.FALLBACK_MODEL]):
            try:
                print(f"Generating fabric closeup V2 with {model_to_use} (attempt {attempt + 1})")
                
                response = await self._generate_with_timeout(
                    model=model_to_use,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE"],
                        image_config=types.ImageConfig(
                            aspect_ratio="9:16",
                            image_size=image_quality if model_to_use == self.PRIMARY_MODEL else None
                        )
                    )
                )
                
                result = self._extract_image_from_response(response)
                self._cache_image(cache_key, result)  # Save to cache
                return result
                
            except Exception as e:
                print(f"Model {model_to_use} failed: {e}")
                if attempt == 1:
                    raise
                print("Retrying with fallback...")
        
        raise ValueError("All models failed")

    async def generate_editorial_print(
        self,
        garment_image: bytes,
        theme: str = "studio_minimal",
        page_number: int = 1,
        image_quality: str = "4K"
    ) -> bytes:
        """
        Generate an editorial product shot highlighting the main print/design
        - NO model - just the garment
        - Artistic presentation (hung, laid flat, or on invisible mannequin)
        - Focus on the print/graphic as the hero
        """
        
        # Check cache first
        cache_key = self._get_cache_key(
            "editorial_print", garment_image, theme, page_number, image_quality
        )
        cached = self._get_cached_image(cache_key)
        if cached:
            return cached
        
        theme_config = THEME_CONFIG.get(theme, THEME_CONFIG["studio_minimal"])
        phrase = CREATIVE_PHRASES[(page_number * 11 + 5) % len(CREATIVE_PHRASES)]
        
        # Vary presentation style based on page number
        presentation_styles = [
            "garment hanging on a premium wooden hanger against the backdrop",
            "garment laid flat in a perfectly styled flat-lay composition",
            "garment on an invisible/ghost mannequin creating 3D form",
            "garment draped elegantly over a minimalist chair or hook",
            "garment floating with subtle shadow, as if suspended in air"
        ]
        presentation = presentation_styles[page_number % len(presentation_styles)]
        
        prompt = f"""You are an award-winning Still Life Photographer specializing in FASHION PRODUCTS.

=== TASK: EDITORIAL PRINT HIGHLIGHT ===
Create a STUNNING editorial photograph of this garment that HIGHLIGHTS THE PRINT/GRAPHIC.
NO MODEL in this image - just the garment itself, presented artistically.

=== PRESENTATION STYLE ===
Show the garment: {presentation}

The PRINT/GRAPHIC on the garment is the HERO of this shot.
Frame the composition so the design is prominently visible and impactful.

=== ARTISTIC DIRECTION ===
This is NOT a boring e-commerce product shot. This is ART.

COMPOSITION:
- Center the garment's print/graphic as the focal point
- Allow the design to breathe with elegant negative space
- Create visual interest through lighting and angles
- The garment should feel premium and desirable

LIGHTING:
- Soft, directional studio lighting
- Gentle gradients that enhance the garment's form
- Subtle shadows to create depth and dimension
- The print colors should pop but not be oversaturated

BACKGROUND:
- Clean, sophisticated backdrop
- Theme: {theme_config['background_desc']}
- Should complement, not compete with the garment
- Options: Solid muted color, soft gradient, subtle texture

=== FROM THE REFERENCE ===
Study the garment in the reference image:
- Reproduce the EXACT print/graphic design
- Match the EXACT colors and placement of the design
- Maintain the garment's shape and proportions
- This is the garment being showcased - accuracy is critical

=== CREATIVE PHRASE ===
Small, elegant text: "{phrase}"
- Subtle corner placement
- Thin, elegant typography
- Does NOT distract from the garment

=== STYLE REFERENCE ===
Think of product photography from:
- Acne Studios product pages
- COS editorials
- Arket lookbooks
- Japanese fashion magazines

=== TECHNICAL ===
- Aspect ratio: 9:16 vertical
- Resolution: {image_quality}
- Studio photography quality
- NO brand names, NO collection text (except the phrase above)

Generate this premium editorial product shot now."""

        garment_pil = self._image_to_pil(garment_image)
        contents = [
            prompt, 
            garment_pil, 
            "This is the garment to photograph. Pay special attention to the PRINT/GRAPHIC design - it must be reproduced exactly and be the hero of the shot."
        ]
        
        for attempt, model_to_use in enumerate([self.PRIMARY_MODEL, self.FALLBACK_MODEL]):
            try:
                print(f"Generating editorial print highlight with {model_to_use} (attempt {attempt + 1})")
                
                response = await self._generate_with_timeout(
                    model=model_to_use,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE"],
                        image_config=types.ImageConfig(
                            aspect_ratio="9:16",
                            image_size=image_quality if model_to_use == self.PRIMARY_MODEL else None
                        )
                    )
                )
                
                result = self._extract_image_from_response(response)
                self._cache_image(cache_key, result)
                return result
                
            except Exception as e:
                print(f"Model {model_to_use} failed: {e}")
                if attempt == 1:
                    raise
                print("Retrying with fallback...")
        
        raise ValueError("All models failed")

    async def generate_collage_layout(
        self,
        front_image: bytes,
        back_image: bytes,
        category: str,
        skin_tone: str = "fair",
        body_type: str = "",
        theme: str = "studio_minimal",
        page_number: int = 1,
        image_quality: str = "4K"
    ) -> bytes:
        """
        Generate creative collage layout with multiple views/angles
        Magazine-style multi-image composition on single page
        """
        
        # Check cache first
        cache_key = self._get_cache_key(
            "collage", front_image, back_image, category, 
            skin_tone, body_type, theme, page_number, image_quality
        )
        cached = self._get_cached_image(cache_key)
        if cached:
            return cached
        
        config = MODEL_CONFIG.get(category, MODEL_CONFIG["teen_boy"])
        skin_desc = SKIN_TONES.get(skin_tone, SKIN_TONES.get("fair", skin_tone))
        theme_config = THEME_CONFIG.get(theme, THEME_CONFIG["studio_minimal"])
        build = body_type if body_type else config["default_build"]
        phrase = CREATIVE_PHRASES[(page_number * 7 + 3) % len(CREATIVE_PHRASES)]
        
        # Different collage layouts based on page number
        collage_styles = [
            "2 images side by side: FRONT view on left (60% width), BACK view on right (40% width), slight size difference for dynamism",
            "3 images: Large FRONT view top left (70% height), Medium BACK view bottom right, small detail crop top right corner",
            "Diagonal split: FRONT view fills upper-left triangle, BACK view fills lower-right triangle",
            "Grid of 4: Front full-body top-left, Back full-body top-right, Front torso close-up bottom-left, Back detail bottom-right",
            "Asymmetric split: Large hero FRONT view (75%), floating smaller BACK view overlapping corner",
        ]
        
        layout_style = collage_styles[page_number % len(collage_styles)]
        
        prompt = f"""You are a world-class Fashion Art Director creating a COLLAGE LAYOUT.

{STRICT_GARMENT_RULES}

=== COLLAGE COMPOSITION ===
{layout_style}

=== MODEL CONSISTENCY (CRITICAL) ===
ALL views in the collage must show the EXACT SAME model:
- Same face, same hairstyle, same skin tone
- Same body proportions
- IDENTICAL model, just different poses/angles

=== MODEL DETAILS ===
- Subject: {config['description']}, {config['age_range']}
- Skin: {skin_desc}
- Build: {build}

=== NATURAL HUMAN APPEARANCE (CRITICAL) ===
The model MUST look like a REAL PERSON, not AI-generated:
- Natural skin texture with pores, not airbrushed
- Hair with realistic flyaways and texture
- Relaxed, genuine expression (not forced smile)
- Natural body language and weight distribution
- Real eyes with natural catchlights

REFERENCE: Think Acne Studios, Our Legacy, or The Row lookbook photos
- Real people, natural poses, minimal retouching

=== GARMENT ===
- FRONT IMAGE: Shows the front of the garment
- BACK IMAGE: Shows the back of the garment
- Copy BOTH exactly as provided in references

=== DESIGN ===
- Background: {theme_config['background_desc']}
- Dividers/separators: Clean, minimal, modern
- Mood: {theme_config['mood']}
- Feel: Editorial fashion magazine spread (not commercial catalog)

=== CREATIVE PHRASE ===
Small text: "{phrase}"
- Elegant, minimal placement
- Does NOT compete with images

=== TECHNICAL ===
- Aspect ratio: 9:16 vertical
- Resolution: {image_quality}
- Editorial magazine quality
- NO brand names on this page

Generate this editorial collage layout now."""

        front_pil = self._image_to_pil(front_image)
        back_pil = self._image_to_pil(back_image)
        
        contents = [
            prompt, 
            front_pil, "FRONT view of garment - copy exactly",
            back_pil, "BACK view of garment - copy exactly"
        ]
        
        for attempt, model_to_use in enumerate([self.PRIMARY_MODEL, self.FALLBACK_MODEL]):
            try:
                print(f"Generating collage layout with {model_to_use} (attempt {attempt + 1})")
                
                response = await self._generate_with_timeout(
                    model=model_to_use,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE"],
                        image_config=types.ImageConfig(
                            aspect_ratio="9:16",
                            image_size=image_quality if model_to_use == self.PRIMARY_MODEL else None
                        )
                    )
                )
                
                result = self._extract_image_from_response(response)
                self._cache_image(cache_key, result)  # Save to cache
                return result
                
            except Exception as e:
                print(f"Model {model_to_use} failed: {e}")
                if attempt == 1:
                    raise
                print("Retrying with fallback...")
        
        raise ValueError("All models failed")

    # ============================================
    # POSE VARIATION REGENERATION
    # ============================================
    
    async def regenerate_with_pose(
        self,
        original_image_bytes: bytes,
        pose_type: str,
        category: str = "men",
        skin_tone: str = "medium",
        image_quality: str = "4K"
    ) -> Optional[bytes]:
        """
        Regenerate an image with a different pose while keeping clothing identical.
        
        Args:
            original_image_bytes: The previously generated image
            pose_type: Key from POSE_TYPES
            category: Model category (men, women, etc.)
            skin_tone: Skin tone preference
            image_quality: Output quality (1K, 2K, 4K)
            
        Returns:
            New image bytes with different pose
        """
        
        # Get pose description
        pose_desc = POSE_TYPES.get(pose_type, POSE_TYPES["catalog_standard"])
        
        # Get model and skin descriptions
        model_info = MODEL_CONFIG.get(category, MODEL_CONFIG["men"])
        skin_desc = SKIN_TONES.get(skin_tone, SKIN_TONES["medium"])
        
        # Quality settings
        quality_map = {"1K": (1024, 1536), "2K": (2048, 3072), "4K": (4096, 6144)}
        target_width, target_height = quality_map.get(image_quality, (4096, 6144))
        
        prompt = f"""
REGENERATE THIS IMAGE WITH A NEW POSE.

CRITICAL RULES:
1. Keep the EXACT SAME clothing/garment - copy every detail pixel-perfect
2. Keep the EXACT SAME model appearance (face, skin, hair)
3. ONLY change the pose to: {pose_desc}

MODEL DETAILS:
- {model_info['description']}, {model_info['age_range']}
- Skin: {skin_desc}

NEW POSE: {pose_desc}

OUTPUT REQUIREMENTS:
- Professional fashion photography
- High-resolution {image_quality} quality ({target_width}x{target_height})
- Clean studio background
- Same lighting style as original
- CLOTHING MUST BE IDENTICAL TO INPUT IMAGE
"""
        
        print(f"🔄 Regenerate pose prompt ({len(prompt)} chars)")
        
        # Load original image
        original_image = Image.open(BytesIO(original_image_bytes))
        img_byte_arr = BytesIO()
        original_image.save(img_byte_arr, format='PNG')
        img_bytes = img_byte_arr.getvalue()
        
        model_to_use = self.primary_model
        
        for attempt in range(2):
            try:
                response = self.client.models.generate_content(
                    model=model_to_use,
                    contents=types.Content(
                        parts=[
                            types.Part.from_bytes(data=img_bytes, mime_type="image/png"),
                            types.Part(text=prompt)
                        ]
                    ),
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE", "TEXT"],
                        temperature=0.7,
                        safety_settings=self._get_safety_settings()
                    )
                )
                
                result = self._extract_image_from_response(response)
                
                if result:
                    print(f"✅ Pose regeneration successful: {len(result)} bytes")
                    return result
                else:
                    print("⚠️ No image in response, retrying...")
                    
            except Exception as e:
                print(f"Pose regeneration attempt {attempt+1} failed: {e}")
                if attempt == 1:
                    raise
                model_to_use = self.fallback_model
                print("Retrying with fallback model...")
        
        return None
