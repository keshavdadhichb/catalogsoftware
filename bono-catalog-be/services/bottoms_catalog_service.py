"""
Master Catalog for Bottoms - Baby Joggers Catalog Generation Service
Specialized for infant/toddler (0-2 years) bottom wear catalogs

Features:
- Toddler model generation (0-2 years)
- Front-image only support
- Strict jogger/bottom garment preservation
- Creative non-repetitive layouts
- Professional cover page generation
"""

import os
import random
from io import BytesIO
from typing import Optional, List, Dict
from PIL import Image
from google import genai
from google.genai import types


# ============================================
# TODDLER MODEL CONFIGURATIONS
# ============================================

TODDLER_CONFIG = {
    "infant_boy": {
        "description": "adorable Indian baby boy toddler",
        "age_range": "0-2 years old",
        "build": "healthy chubby baby proportions",
        "features": "round cheeks, bright curious eyes, tiny fingers"
    }
}

TODDLER_POSES = [
    "standing with support, looking at camera with innocent smile",
    "sitting on soft play mat, giggling playfully",
    "taking first steps, arms slightly raised for balance",
    "sitting with stuffed toy, looking adorable",
    "standing confidently, tiny hands on hips",
    "crawling playfully on soft surface",
    "reaching up with curious expression",
    "clapping hands joyfully"
]

TODDLER_SETTINGS = [
    "soft white studio with gentle diffused lighting",
    "cozy nursery with pastel colors and soft toys",
    "bright playroom with colorful toys in background (blurred)",
    "natural window light setting with soft shadows",
    "minimalist studio with clean white backdrop"
]


# ============================================
# NON-REPETITIVE TAGLINES
# ============================================

BABY_TAGLINES = [
    "Little Steps, Big Style",
    "Comfort in Motion",
    "Playful & Cozy",
    "Adventure Ready",
    "Soft Moves",
    "Tiny Trendsetter",
    "Made for Play",
    "Cuddle Approved",
    "Born to Explore",
    "Snuggle Perfect",
    "Happy Feet",
    "Pure Comfort",
    "Joy in Every Stitch",
    "Little Explorer",
    "Giggles Guaranteed"
]


# ============================================
# STRICT GARMENT PRESERVATION RULES
# ============================================

JOGGER_PRESERVATION_RULES = """
⛔ ABSOLUTELY FORBIDDEN - DO NOT CHANGE:
- The exact colors of the jogger (primary color, accent panels, everything)
- Any prints, graphics, logos, or patterns on the jogger
- The style of elastic waistband and drawstring
- The position and shape of color blocks or panels
- The cuff style at ankles
- Pocket design and placement
- Any stitching patterns or design elements

✅ MANDATORY REQUIREMENTS:
- Copy the jogger PIXEL-PERFECT from the reference image
- Maintain the EXACT color values - no color shifts allowed
- Preserve ALL design elements exactly as shown
- The jogger must look IDENTICAL to the reference
- If there's a print/graphic (like teddy bear), it MUST be preserved exactly

🔍 CRITICAL CHECK:
Before generating, mentally verify:
1. Is the primary color exactly matching?
2. Are accent panels in the correct position?
3. Is the print/graphic preserved?
4. Is the waistband style correct?
5. Are the cuffs accurate?
"""


# ============================================
# LAYOUT STYLES FOR BOTTOMS CATALOG
# ============================================

BOTTOMS_LAYOUT_STYLES = {
    "hero_center": {
        "name": "Hero Center",
        "description": "Toddler model centered, product info elegantly overlaid",
        "prompt_addon": "Center the adorable toddler model prominently in frame. Clean composition with the child as the hero. Subtle text area at bottom."
    },
    "split_duo": {
        "name": "Split Duo",
        "description": "Flat-lay product shot + model wearing it side by side",
        "prompt_addon": "Create a sophisticated split composition: left side shows the jogger laid flat on clean surface, right side shows cute toddler wearing it. 50/50 split."
    },
    "lifestyle_scene": {
        "name": "Lifestyle Scene",
        "description": "Toddler in natural playful environment",
        "prompt_addon": "Capture a candid lifestyle moment - toddler playing naturally, the jogger visible and prominent. Warm, joyful energy. Natural lighting."
    },
    "detail_focus": {
        "name": "Detail Focus",
        "description": "Macro fabric detail + full product shot",
        "prompt_addon": "Split the frame: one section shows beautiful macro detail of the fabric texture and quality, other section shows full jogger on toddler model."
    },
    "playful_collage": {
        "name": "Playful Collage",
        "description": "Multiple cute poses in artistic arrangement",
        "prompt_addon": "Create a playful collage with 2-3 adorable poses of the toddler wearing the jogger. Artistic arrangement with overlapping frames. Fun, energetic composition."
    }
}


# ============================================
# COVER PAGE STYLES
# ============================================

COVER_STYLES = {
    "minimal_elegant": {
        "background": "soft gradient from warm cream to gentle peach",
        "logo_position": "large centered",
        "typography": "elegant serif for collection name, clean sans for details",
        "accent": "subtle gold or rose gold accents"
    },
    "playful_pastel": {
        "background": "soft pastel gradient (baby blue to lavender)",
        "logo_position": "top center, generous size",
        "typography": "friendly rounded fonts, playful but professional",
        "accent": "soft cloud shapes or subtle confetti"
    },
    "clean_white": {
        "background": "pure white with subtle texture",
        "logo_position": "centered with breathing room",
        "typography": "modern minimalist, high contrast",
        "accent": "thin gold line borders"
    }
}


class BottomsCatalogService:
    """Service for generating baby bottoms/joggers catalogs"""
    
    PRIMARY_MODEL = "gemini-3-pro-image-preview"
    FALLBACK_MODEL = "gemini-2.5-flash-image"
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment")
        
        self.client = genai.Client(api_key=self.api_key)
        self.used_taglines = set()
        self.used_layouts = []
    
    def _get_unique_tagline(self) -> str:
        """Get a tagline that hasn't been used yet"""
        available = [t for t in BABY_TAGLINES if t not in self.used_taglines]
        if not available:
            self.used_taglines.clear()
            available = BABY_TAGLINES.copy()
        
        tagline = random.choice(available)
        self.used_taglines.add(tagline)
        return tagline
    
    def _get_next_layout(self) -> Dict:
        """Get next layout style, ensuring variety"""
        layout_keys = list(BOTTOMS_LAYOUT_STYLES.keys())
        
        # Prioritize unused layouts
        unused = [k for k in layout_keys if k not in self.used_layouts]
        if unused:
            chosen = random.choice(unused)
        else:
            self.used_layouts.clear()
            chosen = random.choice(layout_keys)
        
        self.used_layouts.append(chosen)
        return BOTTOMS_LAYOUT_STYLES[chosen]
    
    def _image_to_pil(self, image_bytes: bytes) -> Image.Image:
        """Convert bytes to PIL Image"""
        return Image.open(BytesIO(image_bytes))
    
    async def generate_cover_page(
        self,
        logo_image: Optional[bytes],
        collection_name: str,
        brand_name: str,
        products_list: Optional[List[Dict]] = None,
        season: str = "2026",
        style: str = "minimal_elegant"
    ) -> bytes:
        """Generate beautiful cover page for the catalog with product catalog"""
        
        cover_style = COVER_STYLES.get(style, COVER_STYLES["minimal_elegant"])
        
        # Build product catalog section if provided
        products_section = ""
        if products_list:
            products_section = "\n\nPRODUCT CATALOG TO DISPLAY (in elegant table or list format):\n"
            for i, prod in enumerate(products_list, 1):
                article = prod.get('article', f'ART-{i:03d}')
                name = prod.get('name', f'Product {i}')
                sizes = prod.get('sizes', '0-6M, 6-12M, 12-18M, 18-24M')
                products_section += f"  {i}. {article} - {name} | Sizes: {sizes}\n"
            products_section += "\nDisplay this catalog elegantly on the cover - perhaps in a subtle table or clean list at the bottom."
        
        prompt = f"""Create a stunning, professional catalog cover page for a baby clothing brand.

DESIGN SPECIFICATIONS:
- Background: {cover_style['background']}
- Logo placement: {cover_style['logo_position']}
- Typography style: {cover_style['typography']}
- Design accents: {cover_style['accent']}

CONTENT TO INCLUDE:
- Brand name: "{brand_name}" (prominent, elegant)
- Collection: "{collection_name}"
- Season/Year: {season}
{products_section}

STYLE REQUIREMENTS:
- Ultra-clean, premium aesthetic
- Soft, baby-appropriate color palette
- Professional catalog quality
- High-end fashion brand feel
- Minimalist but impactful

DO NOT include any product images on the cover - this is a title page only.
The design should feel luxurious, warm, and appropriate for premium baby wear.

Output: A beautiful 9:16 portrait catalog cover page.
"""
        
        contents = [prompt]
        if logo_image:
            logo_pil = self._image_to_pil(logo_image)
            contents.append(logo_pil)
            contents[0] = contents[0].replace("Brand name:", "Use the provided logo image prominently. Brand name:")
        
        try:
            response = self.client.models.generate_content(
                model=self.PRIMARY_MODEL,
                contents=contents,
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE"],
                    image_config=types.ImageConfig(
                        aspect_ratio="9:16",
                        image_size="4K"
                    )
                )
            )
            
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    return part.inline_data.data
            
            raise ValueError("No image generated for cover page")
            
        except Exception as e:
            print(f"Cover page generation failed: {e}")
            raise
    
    async def generate_product_page(
        self,
        jogger_image: bytes,
        article_number: str,
        product_name: str,
        sizes: str,
        layout_override: Optional[str] = None,
        minimal_text: bool = True
    ) -> bytes:
        """Generate a beautiful product page with toddler model"""
        
        # Get layout and tagline
        layout = BOTTOMS_LAYOUT_STYLES.get(layout_override) if layout_override else self._get_next_layout()
        tagline = self._get_unique_tagline()
        
        # Random selections for variety
        pose = random.choice(TODDLER_POSES)
        setting = random.choice(TODDLER_SETTINGS)
        toddler = TODDLER_CONFIG["infant_boy"]
        
        # Configure text requirements based on minimal_text flag
        text_instructions = ""
        if not minimal_text:
            text_instructions = f"""
📝 PRODUCT INFORMATION TO DISPLAY:
- Article #: {article_number} (subtle, top corner)
- Name: "{product_name}" (elegant typography)
- Sizes: {sizes} (clean badge format)
- Tagline: "{tagline}" (small, stylish)
"""
        else:
            text_instructions = f"""
📝 NO TEXT OVERLAY:
- Do NOT add any text, article numbers, or sizes on the image.
- Keep the image clean and purely visual.
- The focus should be entirely on the toddler and the garment.
"""

        prompt = f"""Create a professional baby clothing catalog product page.

🎯 REFERENCE IMAGE: The jogger/pants shown in the attached image. This is the EXACT product to feature.

{JOGGER_PRESERVATION_RULES}

👶 MODEL SPECIFICATIONS:
- Model: {toddler['description']}
- Age: {toddler['age_range']}
- Build: {toddler['build']}
- Features: {toddler['features']}
- Pose: {pose}
- Setting: {setting}

📐 LAYOUT STYLE: {layout['name']}
{layout['prompt_addon']}

{text_instructions}

🎨 AESTHETIC REQUIREMENTS:
- Ultra-professional catalog quality
- Baby-appropriate soft color palette
- Clean, uncluttered composition
- Premium fashion magazine feel
- The jogger MUST be the star of the image

🎨 AESTHETIC REQUIREMENTS:
- Ultra-professional catalog quality
- Baby-appropriate soft color palette
- Clean, uncluttered composition
- Premium fashion magazine feel
- The jogger MUST be the star of the image

The toddler should look adorable, natural, and the jogger must be clearly visible and EXACTLY as shown in the reference.

Output: 9:16 portrait professional catalog page.
"""
        
        jogger_pil = self._image_to_pil(jogger_image)
        
        try:
            response = self.client.models.generate_content(
                model=self.PRIMARY_MODEL,
                contents=[prompt, jogger_pil],
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE"],
                    image_config=types.ImageConfig(
                        aspect_ratio="9:16",
                        image_size="4K"
                    )
                )
            )
            
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    return part.inline_data.data
            
            raise ValueError("No image generated for product page")
            
        except Exception as e:
            print(f"Product page generation failed: {e}")
            # Try fallback model
            try:
                response = self.client.models.generate_content(
                    model=self.FALLBACK_MODEL,
                    contents=[prompt, jogger_pil],
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE", "TEXT"]
                    )
                )
                
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'inline_data') and part.inline_data:
                        return part.inline_data.data
                
            except Exception as fallback_error:
                print(f"Fallback also failed: {fallback_error}")
                raise
    
    async def generate_detail_page(
        self,
        jogger_image: bytes,
        product_name: str
    ) -> bytes:
        """Generate a fabric detail/close-up page"""
        
        prompt = f"""Create a beautiful fabric detail page for a baby jogger catalog.

🎯 REFERENCE: The jogger shown in the attached image.

{JOGGER_PRESERVATION_RULES}

📐 COMPOSITION:
- Main focus: Extreme close-up of the fabric texture
- Show the quality of the material
- Highlight any prints, graphics, or design details
- Include a small full-product shot in corner

🎨 STYLE:
- Macro photography aesthetic
- Soft, professional lighting
- Premium catalog quality
- Clean, minimal text overlay

TEXT: "{product_name}" in elegant small typography

Output: 9:16 portrait detail page.
"""
        
        jogger_pil = self._image_to_pil(jogger_image)
        
        try:
            response = self.client.models.generate_content(
                model=self.PRIMARY_MODEL,
                contents=[prompt, jogger_pil],
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE"],
                    image_config=types.ImageConfig(
                        aspect_ratio="9:16",
                        image_size="4K"
                    )
                )
            )
            
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    return part.inline_data.data
            
            raise ValueError("No image generated for detail page")
            
        except Exception as e:
            print(f"Detail page generation failed: {e}")
            raise
    
    async def generate_thank_you_page(
        self,
        brand_name: str,
        contact_info: Optional[str] = None
    ) -> bytes:
        """Generate closing thank you page"""
        
        prompt = f"""Create a beautiful thank you/closing page for a baby clothing catalog.

DESIGN:
- Soft, warm gradient background (matching baby brand aesthetic)
- Large elegant "Thank You" or "धन्यवाद" text
- Brand name: "{brand_name}" in sophisticated typography
- Contact info: {contact_info if contact_info else 'Not provided'}
- Subtle decorative elements (soft shapes, gentle patterns)

STYLE:
- Premium, luxurious feel
- Baby-appropriate soft colors
- Clean and professional
- Warm and inviting

Output: 9:16 portrait closing page.
"""
        
        try:
            response = self.client.models.generate_content(
                model=self.PRIMARY_MODEL,
                contents=[prompt],
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE"],
                    image_config=types.ImageConfig(
                        aspect_ratio="9:16",
                        image_size="4K"
                    )
                )
            )
            
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    return part.inline_data.data
            
            raise ValueError("No image generated for thank you page")
            
        except Exception as e:
            print(f"Thank you page generation failed: {e}")
            raise
    
    async def generate_back_view_page(
        self,
        jogger_image: bytes,
        article_number: str,
        product_name: str
    ) -> bytes:
        """
        Generate back view of jogger on toddler model.
        CRITICAL: Back should be SOLID COLOR ONLY - no print/pattern visible.
        The print/graphic is only on the front.
        """
        
        pose = random.choice([
            "toddler standing with back to camera, looking over shoulder with cute smile",
            "toddler walking away, back visible, in playful motion",
            "toddler turned around, showing the back of the pants clearly"
        ])
        setting = random.choice(TODDLER_SETTINGS)
        toddler = TODDLER_CONFIG["infant_boy"]
        
        prompt = f"""Create a professional catalog page showing the BACK VIEW of baby joggers.

🎯 REFERENCE IMAGE: The jogger shown in the attached image. Use this to understand the COLORS ONLY.

⚠️ CRITICAL BACK VIEW RULES:
- The BACK of the jogger should be SOLID COLOR ONLY
- NO prints, NO graphics, NO patterns on the back
- The back is just the plain fabric in the same color as the front
- Copy the EXACT primary color from the reference (the blue/main color)
- Copy the EXACT accent panel colors and positions
- But the teddy bear/graphic is ONLY on the FRONT - DO NOT show it on the back

👶 MODEL SPECIFICATIONS:
- Model: {toddler['description']}
- Age: {toddler['age_range']}
- Build: {toddler['build']}
- Pose: {pose}
- Setting: {setting}
- The toddler's BACK should face the camera

📝 PRODUCT INFO TO DISPLAY:
- Article #: {article_number}
- Name: "{product_name}"
- Text: "Back View" (subtle indicator)

🎨 STYLE:
- Clean professional catalog quality
- Soft baby-appropriate lighting
- The jogger back must be CLEARLY VISIBLE
- Premium fashion catalog aesthetic

Output: 9:16 portrait back view catalog page.
"""
        
        jogger_pil = self._image_to_pil(jogger_image)
        
        try:
            response = self.client.models.generate_content(
                model=self.PRIMARY_MODEL,
                contents=[prompt, jogger_pil],
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE"],
                    image_config=types.ImageConfig(
                        aspect_ratio="9:16",
                        image_size="4K"
                    )
                )
            )
            
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    return part.inline_data.data
            
            raise ValueError("No image generated for back view page")
            
        except Exception as e:
            print(f"Back view page generation failed: {e}")
            raise
    
    async def generate_print_closeup_page(
        self,
        jogger_image: bytes,
        product_name: str
    ) -> bytes:
        """
        Generate extreme close-up of the print/graphic on the jogger.
        Shows the artistic detail of any prints, logos, or graphics.
        """
        
        prompt = f"""Create a stunning close-up showcase of the print/graphic on baby joggers.

🎯 REFERENCE: The jogger shown in the attached image. Focus on the PRINT/GRAPHIC (like the teddy bear).

📐 COMPOSITION:
- EXTREME close-up of the print/graphic on the jogger
- Fill 70% of the frame with the detailed print
- Show every detail of the graphic clearly
- Artistic macro photography style
- Include a subtle small full-product shot in the corner (10% of frame)

🎨 AESTHETIC:
- Premium catalog quality
- Soft, even lighting to show print details
- Slight depth of field effect
- The fabric texture should be visible around the print
- Ultra-sharp focus on the graphic

{JOGGER_PRESERVATION_RULES}

📝 TEXT:
- "{product_name}" in subtle elegant typography
- "Print Detail" as a small label

STYLE: High-end fashion catalog, macro photography, premium feel

Output: 9:16 portrait print close-up page.
"""
        
        jogger_pil = self._image_to_pil(jogger_image)
        
        try:
            response = self.client.models.generate_content(
                model=self.PRIMARY_MODEL,
                contents=[prompt, jogger_pil],
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE"],
                    image_config=types.ImageConfig(
                        aspect_ratio="9:16",
                        image_size="4K"
                    )
                )
            )
            
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    return part.inline_data.data
            
            raise ValueError("No image generated for print close-up page")
            
        except Exception as e:
            print(f"Print close-up page generation failed: {e}")
            raise
    
    async def generate_fabric_aesthetic_page(
        self,
        jogger_image: bytes,
        product_name: str
    ) -> bytes:
        """
        Generate a very aesthetic shot of JUST the fabric/cloth.
        Artistic, editorial style showcasing the material quality.
        """
        
        prompt = f"""Create an EXTREMELY AESTHETIC editorial shot showcasing baby jogger fabric.

🎯 REFERENCE: Use the jogger in the attached image for color and fabric reference.

📐 COMPOSITION - ARTISTIC FABRIC SHOWCASE:
- The jogger laid out artistically, draped naturally
- Beautiful fabric folds and textures
- Soft, dreamy lighting (golden hour feel)
- Artistic styling like a fashion editorial
- NO MODEL in this shot - just the garment itself
- Perhaps with soft props (wooden toys, cotton flowers, etc.)

🎨 AESTHETIC REQUIREMENTS:
- VERY VERY aesthetic and artistic
- Magazine editorial quality
- Soft pastel background or natural texture (linen, wood)
- Beautiful natural lighting with soft shadows
- The fabric should look luxurious and touchable
- Highlight the softness and quality of the material

{JOGGER_PRESERVATION_RULES}

📝 MINIMAL TEXT:
- "{product_name}" in delicate, artistic typography
- "100% Cotton Comfort" or similar quality indicator

MOOD: Dreamy, soft, luxurious, premium baby fashion editorial

Output: 9:16 portrait artistic fabric page.
"""
        
        jogger_pil = self._image_to_pil(jogger_image)
        
        try:
            response = self.client.models.generate_content(
                model=self.PRIMARY_MODEL,
                contents=[prompt, jogger_pil],
                config=types.GenerateContentConfig(
                    response_modalities=["IMAGE"],
                    image_config=types.ImageConfig(
                        aspect_ratio="9:16",
                        image_size="4K"
                    )
                )
            )
            
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    return part.inline_data.data
            
            raise ValueError("No image generated for fabric aesthetic page")
            
        except Exception as e:
            print(f"Fabric aesthetic page generation failed: {e}")
            raise

