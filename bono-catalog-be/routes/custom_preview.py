"""
Custom Preview API - AI-powered mockup generation
Generates realistic mockups with text/logo printed on garments
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import base64
import os

router = APIRouter(prefix="/api/custom-preview", tags=["custom-preview"])

# Import the Gemini client
from services.gemini_client import GeminiClient

class MockupRequest(BaseModel):
    garment_type: str  # "hoodie" or "tshirt"
    color: str  # "black", "white", "red"
    text: str
    font_style: str  # "bold", "script", "minimalist"
    text_color: str  # hex color
    position: str  # "front_center", "front_left", "back_center", "left_sleeve"
    logo_base64: Optional[str] = None  # base64 encoded logo image

class MockupResponse(BaseModel):
    success: bool
    image_base64: Optional[str] = None
    error: Optional[str] = None


@router.post("/generate-mockup", response_model=MockupResponse)
async def generate_mockup(request: MockupRequest):
    """
    Generate a professional mockup with text/logo printed on garment using Gemini AI
    """
    try:
        gemini = GeminiClient()
        
        # Build the prompt for Gemini
        position_desc = {
            "front_center": "centered on the front chest area",
            "front_left": "on the left chest area (small, like a logo placement)",
            "back_center": "centered on the back",
            "left_sleeve": "on the left sleeve"
        }.get(request.position, "centered on the front")
        
        color_desc = {
            "black": "black",
            "white": "white/cream",
            "red": "burgundy red"
        }.get(request.color, request.color)
        
        garment_desc = "oversized hoodie with kangaroo pocket" if request.garment_type == "hoodie" else "oversized drop-shoulder t-shirt"
        
        # Determine text color visibility
        if request.color == "black":
            suggested_text_color = "white or bright colored"
        else:
            suggested_text_color = "dark or contrasting colored"
        
        prompt = f"""You are a professional product photographer creating a REALISTIC MOCKUP.

=== TASK ===
Create a professional e-commerce product photo of a {color_desc} {garment_desc} with CUSTOM TEXT PRINTED on it.

=== GARMENT ===
- Type: {garment_desc}
- Color: {color_desc}
- Style: Premium quality, oversized streetwear fit
- Shot: Front view, flat lay or invisible mannequin, on clean white/light gray background

=== PRINTED TEXT ===
The text "{request.text}" must appear SCREEN-PRINTED on the garment:
- Position: {position_desc}
- Style: {request.font_style} typography
- Color: {request.text_color} (or {suggested_text_color} for visibility)
- The text must look ACTUALLY PRINTED on the fabric, not photoshopped on top
- Show subtle fabric texture through the print
- The print should follow any natural fabric folds/contours

=== REALISM REQUIREMENTS ===
- The print must look like real screen printing or DTG printing
- NOT like text floating on top of the image
- Subtle shadows under the print where it meets fabric
- Print should have slight texture matching the fabric weave
- If fabric has folds, the print should distort slightly with the fold

=== PHOTOGRAPHY STYLE ===
- Professional e-commerce product photography
- Clean, bright studio lighting
- Minimal shadows
- The garment should be the hero, the print clearly visible
- High resolution, sharp focus

=== OUTPUT ===
Generate a single product photo that looks like it came from a professional fashion brand's website.
The print must look 100% real and professionally applied."""

        # Generate the mockup using GeminiClient's proven pattern
        from google import genai
        from google.genai import types
        
        contents = [prompt]
        
        # If logo provided, include it
        if request.logo_base64:
            try:
                logo_bytes = base64.b64decode(request.logo_base64.split(',')[1] if ',' in request.logo_base64 else request.logo_base64)
                logo_pil = gemini._image_to_pil(logo_bytes)
                contents.extend([
                    logo_pil,
                    f"Also include this logo on the garment, positioned near the text or as specified."
                ])
            except Exception as e:
                print(f"Failed to process logo: {e}")
        
        # Try primary model first, then fallback
        models_to_try = [gemini.PRIMARY_MODEL, gemini.FALLBACK_MODEL]
        last_error = None
        
        for model in models_to_try:
            try:
                print(f"🎨 Trying model: {model}")
                response = await gemini._generate_with_timeout(
                    model=model,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE"],
                    )
                )
                
                # Extract image from response
                result_bytes = gemini._extract_image_from_response(response)
                result_base64 = base64.b64encode(result_bytes).decode('utf-8')
                
                print(f"✅ Successfully generated mockup with {model}")
                return MockupResponse(
                    success=True,
                    image_base64=f"data:image/png;base64,{result_base64}"
                )
                
            except Exception as e:
                print(f"⚠️ Model {model} failed: {e}")
                last_error = e
                continue
        
        # All models failed
        raise last_error or Exception("All models failed")
        
    except Exception as e:
        print(f"Mockup generation failed: {e}")
        import traceback
        traceback.print_exc()
        return MockupResponse(
            success=False,
            error=str(e)
        )


class PosterRequest(BaseModel):
    garment_type: str  # "hoodie" or "tshirt"
    color: str  # "black", "white", "red"
    text: str
    font_style: str  # "bold", "script", "minimalist"
    text_color: str  # hex color
    logo_base64: Optional[str] = None  # base64 encoded logo image
    theme: str = "streetwear"  # streetwear, minimal, luxury, urban


@router.post("/generate-poster", response_model=MockupResponse)
async def generate_poster(request: PosterRequest):
    """
    Generate a professional marketing poster with text/logo using Gemini AI
    """
    try:
        gemini = GeminiClient()
        
        color_desc = {
            "black": "black",
            "white": "white/cream",
            "red": "burgundy red"
        }.get(request.color, request.color)
        
        garment_desc = "oversized hoodie" if request.garment_type == "hoodie" else "oversized t-shirt"
        
        theme_styles = {
            "streetwear": "urban streetwear aesthetic, graffiti elements, bold colors, hip-hop culture vibes",
            "minimal": "clean minimalist design, lots of white space, subtle typography, Scandinavian style",
            "luxury": "premium luxury feel, gold accents, elegant typography, high-fashion editorial",
            "urban": "city backdrop, night photography, neon lights, metropolitan vibes"
        }
        theme_desc = theme_styles.get(request.theme, theme_styles["streetwear"])
        
        # Text color for visibility
        if request.color == "black":
            text_visibility = "white or bright neon colors"
        else:
            text_visibility = "dark or bold contrasting colors"
        
        prompt = f"""You are a world-class fashion marketing designer creating a STUNNING POSTER.

=== TASK ===
Create a professional fashion marketing poster featuring a {color_desc} {garment_desc} with the text "{request.text}" as the hero element.

=== DESIGN STYLE ===
- Theme: {theme_desc}
- This is a MARKETING POSTER, not just a product photo
- The design should be eye-catching, shareable, and premium quality
- Include creative graphic elements, textures, or backgrounds

=== TEXT "{request.text}" ===
- This text should be the HERO of the poster
- Style: {request.font_style} typography
- Color: {request.text_color} ({text_visibility} for visibility)
- The text can be:
  - Printed on the garment AND/OR
  - Displayed as large typography element in the design
- Make the text impactful and memorable

=== GARMENT ===
- Type: {color_desc} {garment_desc}
- Should be featured prominently
- Can be worn by a model or displayed artistically
- Professional product photography quality

=== COMPOSITION ===
- Poster format (portrait or square)
- Balance between text, product, and design elements
- Professional fashion brand quality
- Could include:
  - Creative backgrounds
  - Graphic overlays
  - Artistic lighting effects
  - Typography treatments

=== OUTPUT ===
Generate a single marketing poster that looks like it came from a major streetwear brand's campaign.
This should be social media worthy and professionally designed."""

        from google import genai
        from google.genai import types
        
        contents = [prompt]
        
        # If logo provided, include it
        if request.logo_base64:
            try:
                logo_bytes = base64.b64decode(request.logo_base64.split(',')[1] if ',' in request.logo_base64 else request.logo_base64)
                logo_pil = gemini._image_to_pil(logo_bytes)
                contents.extend([
                    logo_pil,
                    "Incorporate this brand logo elegantly into the poster design."
                ])
            except Exception as e:
                print(f"Failed to process logo: {e}")
        
        # Try primary model first, then fallback
        models_to_try = [gemini.PRIMARY_MODEL, gemini.FALLBACK_MODEL]
        last_error = None
        
        for model in models_to_try:
            try:
                print(f"🎨 Trying poster generation with: {model}")
                response = await gemini._generate_with_timeout(
                    model=model,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        response_modalities=["IMAGE"],
                    )
                )
                
                # Extract image from response
                result_bytes = gemini._extract_image_from_response(response)
                result_base64 = base64.b64encode(result_bytes).decode('utf-8')
                
                print(f"✅ Successfully generated poster with {model}")
                return MockupResponse(
                    success=True,
                    image_base64=f"data:image/png;base64,{result_base64}"
                )
                
            except Exception as e:
                print(f"⚠️ Model {model} failed: {e}")
                last_error = e
                continue
        
        # All models failed
        raise last_error or Exception("All models failed")
        
    except Exception as e:
        print(f"Poster generation failed: {e}")
        import traceback
        traceback.print_exc()
        return MockupResponse(
            success=False,
            error=str(e)
        )
