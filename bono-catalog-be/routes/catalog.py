"""
Photo & Poster Generation API Routes
Full Gemini-based generation (no PIL overlay)
"""

import io
import zipfile
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from enum import Enum
from PIL import Image

from services.gemini_client import GeminiClient
from services.image_processor import ImageProcessor
from services.upscaler import upscale_to_target
from services.video_service import VideoService
from services.bottoms_catalog_service import BottomsCatalogService


router = APIRouter()


class CategoryEnum(str, Enum):
    men = "men"
    women = "women"
    teen_boy = "teen_boy"
    teen_girl = "teen_girl"
    infant_boy = "infant_boy"
    infant_girl = "infant_girl"


# Layout styles with descriptions for frontend
LAYOUT_CONFIGS = {
    "hero_bottom": {
        "name": "Hero Bottom",
        "description": "Large headline at bottom, model above",
        "text_fields": ["headline", "subtext"],
        "preview": "Model takes 70% of image, bold headline at bottom 30%"
    },
    "split_vertical": {
        "name": "Split Vertical",
        "description": "Image left, text panel right",
        "text_fields": ["headline", "subtext", "price"],
        "preview": "50/50 split - model on left, clean text panel on right"
    },
    "magazine_cover": {
        "name": "Magazine Cover",
        "description": "Title at top, model center, details at bottom",
        "text_fields": ["brand", "headline", "subtext"],
        "preview": "Classic magazine style with brand masthead"
    },
    "minimal_corner": {
        "name": "Minimal Corner",
        "description": "Small text in corner, model dominates",
        "text_fields": ["brand", "tagline"],
        "preview": "95% model, subtle brand in corner"
    },
    "overlay_gradient": {
        "name": "Overlay Gradient",
        "description": "Gradient overlay with text on image",
        "text_fields": ["headline", "subtext", "cta"],
        "preview": "Full-bleed image with gradient text overlay"
    },
    "framed_border": {
        "name": "Framed Border",
        "description": "White border frame around image",
        "text_fields": ["headline", "subtext"],
        "preview": "Image with elegant white border and text below"
    },
    "bold_typography": {
        "name": "Bold Typography",
        "description": "Huge impactful text, model secondary",
        "text_fields": ["headline"],
        "preview": "60% typography, 40% model - high impact"
    },
    "product_focus": {
        "name": "Product Focus",
        "description": "Clean, product-centric catalog style",
        "text_fields": ["headline", "price", "sizes"],
        "preview": "E-commerce style with product details"
    },
    "diagonal_split": {
        "name": "Diagonal Split",
        "description": "Dynamic diagonal divide with text",
        "text_fields": ["headline", "subtext"],
        "preview": "Diagonal composition for dynamic energy"
    },
    "centered_minimal": {
        "name": "Centered Minimal",
        "description": "Model centered, text above and below",
        "text_fields": ["brand", "headline"],
        "preview": "Balanced, gallery-style presentation"
    },
    "story_card": {
        "name": "Story Card",
        "description": "Instagram story style - 9:16 full bleed",
        "text_fields": ["headline", "cta"],
        "preview": "Social media optimized format"
    },
    "lookbook_spread": {
        "name": "Lookbook Spread",
        "description": "Editorial lookbook with multiple elements",
        "text_fields": ["brand", "headline", "subtext", "price"],
        "preview": "Rich editorial with all text elements"
    },
    "orange_diagonal": {
        "name": "Orange Diagonal",
        "description": "BONO style - split background with diagonal banner",
        "text_fields": ["brand", "headline", "subtext", "tagline"],
        "preview": "White/orange split with dynamic diagonal element"
    },
    "yellow_vibrant": {
        "name": "Yellow Vibrant",
        "description": "Modern pop - bright yellow with purple accents",
        "text_fields": ["headline", "subtext", "brand"],
        "preview": "Bold yellow background with geometric purple elements"
    },
    "pink_elegant": {
        "name": "Pink Elegant",
        "description": "Runway style - soft pink with elegant typography",
        "text_fields": ["headline", "subtext", "brand"],
        "preview": "Blush pink with flowing script and vertical text bars"
    },
    "orange_framed": {
        "name": "Orange Framed",
        "description": "Premium frame - deep orange with white frame",
        "text_fields": ["headline", "tagline", "brand"],
        "preview": "Deep orange with decorative white frame and layered text"
    },
    "minimalist_editorial": {
        "name": "Minimalist Editorial",
        "description": "High-end magazine spread with white space",
        "text_fields": ["headline", "subtext"],
        "preview": "Off-white background, thin serif typography, vertical divider"
    },
    "urban_brutalist": {
        "name": "Urban Brutalist",
        "description": "Edgy streetwear with concrete texture",
        "text_fields": ["headline", "subtext"],
        "preview": "Concrete background, distressed text, technical overlays"
    },
    "warm_earth": {
        "name": "Warm Earth Tones",
        "description": "Organic natural feel with earth colors",
        "text_fields": ["headline", "subtext", "tagline"],
        "preview": "Terracotta, sage, sand collage with botanical elements"
    },
    "dark_luxury": {
        "name": "Dark Mode Luxury",
        "description": "Premium dark with gold accents",
        "text_fields": ["headline", "subtext"],
        "preview": "Charcoal background with metallic gold typography"
    },
    "dynamic_typography": {
        "name": "Dynamic Typography",
        "description": "Text as major visual element",
        "text_fields": ["headline", "subtext"],
        "preview": "Large translucent text overlay, energetic modern feel"
    },
    "polaroid_pip": {
        "name": "Polaroid Picture-in-Picture",
        "description": "Macro background with floating Polaroid inset",
        "text_fields": ["brand", "headline", "subtext"],
        "preview": "Full-bleed zoomed back view as textural background. Floating in corner: a smaller 'Polaroid card' with thick white border containing sharp front view. Text strictly inside the white border of inset card. Background remains uncluttered and immersive."
    },
    "vertical_diptych": {
        "name": "50/50 Vertical Diptych",
        "description": "Clean split-screen for front vs back comparison",
        "text_fields": ["brand", "headline"],
        "preview": "Canvas split exactly down middle vertically. Left pane: front view. Right pane: back view. Thin white gutter between. Typography centered bridging both columns or anchored at bottom spanning full width. Equal visual weight, clarity-focused lookbook style."
    },
    "hero_sidebar_strip": {
        "name": "Hero with Sidebar Strip",
        "description": "75% hero image with thumbnail detail strip",
        "text_fields": ["headline", "subtext", "tagline"],
        "preview": "75-80% of canvas: single large hero lifestyle shot (full body). Narrow vertical strip on side: 3-4 stacked square thumbnails showing fabric texture, print detail, cuff closeup. Text in negative space of hero or top of sidebar. Hero sells vibe, strip sells quality."
    },
    "scrapbook_stack": {
        "name": "Offset Scrapbook Stack",
        "description": "Two overlapping photos like thrown on table",
        "text_fields": ["headline", "brand"],
        "preview": "Two medium rectangle photos overlapping diagonally, offset off-center like casually thrown on table. Bottom photo slightly faded/grayscale. Top photo full color with drop shadow for depth. Organic, youthful, street aesthetic. Typography loose, overlapping corners or vertical along edge."
    },
    "ghost_double_exposure": {
        "name": "Ghost Double Exposure",
        "description": "Artistic seamless blend with no borders",
        "text_fields": ["headline", "subtext"],
        "preview": "Background: large desaturated B&W or low-opacity closeup of model face or garment back print. Foreground: sharp full-color cutout of model in different pose (no box/border). Images blend seamlessly. Large bold text sandwiched between layers (behind foreground, in front of background) for 3D depth."
    },
    "typographic_gutter": {
        "name": "Typographic Gutter Split",
        "description": "Bold text band divides images",
        "text_fields": ["brand", "headline"],
        "preview": "Two images separated not by line but by thick bold typography band. Top image and bottom image with large text band in middle (brand name/collection). Or side-by-side with vertical text strip down center. Text IS the frame structure. Very modern high-impact, forces reading as eyes transition between images."
    }
}


@router.get("/layouts")
async def get_layouts():
    """Get available layouts with their configurations"""
    return LAYOUT_CONFIGS


@router.post("/generate")
async def generate_and_download(
    # Basic fields
    brand_name: str = Form(...),
    category: CategoryEnum = Form(...),
    generation_mode: str = Form("photo"),
    
    # Model appearance
    skin_tone: str = Form("fair"),
    hair_type: str = Form("short black hair"),
    body_type: str = Form(""),
    
    # Shared fields
    shot_angle: str = Form("front_facing"),
    pose_type: str = Form("catalog_standard"),
    fit_type: str = Form("regular"),
    
    # Photo mode
    creative_direction: str = Form(""),
    fabric_description: str = Form(""),
    
    # Poster mode - Theme & Layout
    marketing_theme: str = Form("studio_minimal"),
    prop: str = Form("none"),
    layout_style: str = Form("hero_bottom"),
    image_quality: str = Form("4K"),  # Options: "1K", "2K", "4K"
    
    # Text fields for poster (Gemini renders these directly)
    headline: str = Form(""),
    subtext: str = Form(""),
    brand_text: str = Form(""),
    price: str = Form(""),
    cta: str = Form(""),
    tagline: str = Form(""),
    
    # Images
    front_images: List[UploadFile] = File(...),
    back_images: Optional[List[UploadFile]] = File(None),
    logo: Optional[UploadFile] = File(None)
):
    """Generate model photos or marketing posters and return ZIP"""
    
    is_closeup_mode = generation_mode in ["fabric-close-up", "hero-close-up"]
    if not is_closeup_mode:
        if not back_images or len(front_images) != len(back_images):
            raise HTTPException(status_code=400, detail="Number of front and back images must match")
    
    if len(front_images) < 1 or len(front_images) > 5:
        raise HTTPException(status_code=400, detail="Must provide 1-5 products")
    
    try:
        gemini = GeminiClient()
        processor = ImageProcessor()
        
        # Read uploads
        front_data = [await f.read() for f in front_images]
        back_data = [await b.read() for b in (back_images or [])]
        logo_data = await logo.read() if logo else None
        
        # Preprocess garments
        print(f"Processing {len(front_data)} products...")
        front_processed = [processor.prepare_garment(f) for f in front_data]
        back_processed = [processor.prepare_garment(b) for b in back_data]
        
        
        # Parse quality - strip _UPSCALE suffix for Gemini
        # 4K_UPSCALE → generate at "4K", then upscale to 8K later
        # 2K_UPSCALE → generate at "2K", then upscale to 4K later
        if image_quality.endswith("_UPSCALE"):
            internal_quality = image_quality.replace("_UPSCALE", "")
        else:
            internal_quality = image_quality
        
        print(f"🎨 Quality: {image_quality} (generate: {internal_quality})")
        
        generated_images = []
        is_poster_mode = generation_mode == "poster"
        
        if is_closeup_mode:
            for i, front in enumerate(front_processed):
                product_num = i + 1
                print(f"Generating closeup for product {product_num}/{len(front_processed)}...")
                
                if generation_mode == "fabric-close-up":
                    fabric_image = await gemini.generate_fabric_closeup(
                        garment_image=front,
                        theme=marketing_theme,
                        collection_name=brand_name,
                        fabric_description=fabric_description,
                        image_quality=internal_quality
                    )
                    generated_images.append((f"product_{product_num}_fabric.png", fabric_image))
                elif generation_mode == "hero-close-up":
                    hero_image = await gemini.generate_detail_highlight(
                        garment_image=front,
                        theme=marketing_theme,
                        collection_name=brand_name,
                        image_quality=internal_quality
                    )
                    generated_images.append((f"product_{product_num}_hero.png", hero_image))
        else:
            for i, (front, back) in enumerate(zip(front_processed, back_processed)):
                product_num = i + 1
                print(f"Generating product {product_num}/{len(front_processed)}...")
                
                if is_poster_mode:
                    # Build text dict for the layout
                    text_content = {
                        "headline": headline,
                        "subtext": subtext,
                        "brand": brand_text or brand_name,
                        "price": price,
                        "cta": cta,
                        "tagline": tagline
                    }
                    
                    # Generate poster with Gemini (text included in generation)
                    poster = await gemini.generate_marketing_poster(
                        garment_image=front,
                        logo_image=logo_data,
                        category=category,
                        skin_tone=skin_tone,
                        body_type=body_type,
                        marketing_theme=marketing_theme,
                        prop=prop,
                        pose_type=pose_type,
                        fit_type=fit_type,
                        shot_angle=shot_angle,
                        layout_style=layout_style,
                        text_content=text_content,
                        image_quality=internal_quality
                    )
                    
                    generated_images.append((f"product_{product_num}_poster.png", poster))
                else:
                    # Generate simple photos
                    front_model = await gemini.generate_model_image(
                        garment_image=front,
                        category=category,
                        view="front",
                        skin_tone=skin_tone,
                        hair_type=hair_type,
                        body_type=body_type,
                        shot_angle=shot_angle,
                        pose_type=pose_type,
                        fit_type=fit_type,
                        creative_direction=creative_direction,
                        image_quality=internal_quality
                    )
                    
                    back_model = await gemini.generate_model_image(
                        garment_image=back,
                        category=category,
                        view="back",
                        skin_tone=skin_tone,
                        hair_type=hair_type,
                        body_type=body_type,
                        shot_angle=shot_angle,
                        pose_type=pose_type,
                        fit_type=fit_type,
                        creative_direction=creative_direction,
                        image_quality=internal_quality
                    )
                    
                    generated_images.append((f"product_{product_num}_front.png", front_model))
                    generated_images.append((f"product_{product_num}_back.png", back_model))
        
        print(f"Generated {len(generated_images)} images")
        
        # ========== UPSCALING LOGIC ==========
        # Parse quality selection for upscaling:
        # 1K, 2K, 4K = pure generation, no upscale
        # 2K_UPSCALE = generate at 2K, upscale to 4K
        # 4K_UPSCALE = generate at 4K, upscale to 8K
        
        should_upscale = image_quality.endswith("_UPSCALE")
        if should_upscale:
            if image_quality == "2K_UPSCALE":
                upscale_target = "4K"
            else:  # 4K_UPSCALE
                upscale_target = "8K"
            
            print(f"📐 Upscaling {len(generated_images)} images to {upscale_target}...")
            upscaled_images = []
            for filename, image_bytes in generated_images:
                try:
                    upscaled = upscale_to_target(image_bytes, upscale_target)
                    print(f"  ✅ {filename}: {len(image_bytes)} → {len(upscaled)} bytes")
                    upscaled_images.append((filename, upscaled))
                except Exception as upscale_error:
                    print(f"  ⚠️ Upscale failed for {filename}: {upscale_error}")
                    upscaled_images.append((filename, image_bytes))  # Use original
            generated_images = upscaled_images
            print(f"✅ Upscaling complete")
        
        print("Creating ZIP...")
        
        # Create ZIP
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            for filename, image_bytes in generated_images:
                print(f"Adding: {filename} ({len(image_bytes)} bytes)")
                zf.writestr(filename, image_bytes)
        
        zip_buffer.seek(0)
        
        safe_brand = "".join(c for c in brand_name if c.isalnum() or c in ' -_').strip() or "output"
        mode_suffix = "posters" if is_poster_mode else "photos"
        
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={
                "Content-Disposition": f'attachment; filename="{safe_brand}_{mode_suffix}.zip"'
            }
        )
        
    except Exception as e:
        print(f"Generation failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@router.get("/health")
async def health_check():
    return {"status": "ok"}


@router.get("/test-zip")
async def test_zip():
    """Test endpoint for ZIP downloads"""
    from PIL import Image
    
    img = Image.new('RGB', (200, 200), color='blue')
    img_buffer = io.BytesIO()
    img.save(img_buffer, format='PNG')
    img_bytes = img_buffer.getvalue()
    
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.writestr('test.png', img_bytes)
    
    zip_buffer.seek(0)
    
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": 'attachment; filename="test.zip"'}
    )


@router.get("/presets")
async def get_style_presets():
    from services.gemini_client import STYLE_PRESETS, POSE_TYPES, PROP_INTERACTION, THEME_CONFIG
    return {
        "presets": {k: v["description"] for k, v in STYLE_PRESETS.items()},
        "poses": list(POSE_TYPES.keys()),
        "props": list(PROP_INTERACTION.keys()),
        "themes": list(THEME_CONFIG.keys()),
        "layouts": LAYOUT_CONFIGS
    }


# ============================================
# MASTER CATALOG FEATURE (ENHANCED)
# ============================================

# Layout types for catalog pages
LAYOUT_TYPES = ['front', 'back', 'combo', 'fabric_closeup', 'detail_highlight', 'model_callout']

# Assorted options for variety in catalog
CATALOG_POSES = ["catalog_standard", "hands_on_hips", "hands_in_pockets", "arms_crossed", "walking", "leaning_wall", "editorial_dramatic"]
CATALOG_PROPS = ["none", "sunglasses", "cap", "watch", "headphones"]
CATALOG_LAYOUTS = ["hero_bottom", "split_vertical", "magazine_cover", "overlay_gradient", "framed_border", "product_focus", "lookbook_spread"]


def plan_catalog_pages(num_products: int, max_pages: int = 10) -> list:
    """
    Plan smart layout distribution for catalog pages.
    Returns list of tuples: (layout_type, product_index, additional_data)
    
    Target: 10-12 pages for up to 10 products (OPTIMIZED for cost)
    - Collages are 2x efficient (front+back in 1 page)
    - More collages = fewer total generations = lower cost
    """
    pages = []
    
    # For very few products, show all views in collages
    if num_products <= 2:
        for i in range(num_products):
            pages.append(('collage', i, {'page_number': i + 1}))
        # Add one fabric closeup
        pages.append(('fabric_v2', 0, {'page_number': num_products + 1}))
        return pages
    
    # For 3-10 products, use smart distribution
    content_pages = max_pages - 2  # Reserve for cover and thank you (= 8 pages)
    
    # COST-OPTIMIZED Distribution:
    # - More collages (each shows front+back = 2 views for 1 generation)
    # - 1 fabric close-up only
    # - Fewer single pages
    
    # Use collages for most products (each collage = 2 views, 1 generation)
    num_collages = min(num_products, 4)  # Up to 4 collages (= 8 product views)
    num_fabric = 1  # Only 1 fabric shot to save cost
    
    # Remaining slots for single views
    remaining = content_pages - num_collages - num_fabric
    
    used_products = set()
    page_idx = 0
    
    # 1. Add collage pages (front+back in creative compositions)
    for i in range(num_collages):
        prod_idx = i % num_products
        pages.append(('collage', prod_idx, {'page_number': i + 1}))
        used_products.add(prod_idx)
        page_idx += 1
    
    # 2. Add fabric closeup pages (artsy fabric shots)
    fabric_idx = num_collages
    for i in range(num_fabric):
        prod_idx = (fabric_idx + i) % num_products
        pages.append(('fabric_v2', prod_idx, {'page_number': page_idx + 1}))
        page_idx += 1
    
    # 3. Fill remaining with single product pages (alternating front/back)
    view_toggle = True
    current_product = 0
    
    for i in range(remaining):
        if page_idx >= content_pages:
            break
        
        prod_idx = current_product % num_products
        view = 'front' if view_toggle else 'back'
        
        pages.append(('single_v2', prod_idx, {'view': view, 'page_number': page_idx + 1}))
        
        view_toggle = not view_toggle
        if not view_toggle:  # After back view, move to next product
            current_product += 1
        page_idx += 1
    
    return pages


def create_pdf_from_images(image_bytes_list: list) -> bytes:
    """Create a PDF from a list of image bytes (one image per page)"""
    from PIL import Image
    from io import BytesIO
    
    if not image_bytes_list:
        raise ValueError("No images to create PDF")
    
    # Convert all images to PIL and RGB mode
    pil_images = []
    for img_bytes in image_bytes_list:
        img = Image.open(BytesIO(img_bytes))
        if img.mode != 'RGB':
            img = img.convert('RGB')
        pil_images.append(img)
    
    # Create PDF
    pdf_buffer = BytesIO()
    pil_images[0].save(
        pdf_buffer, 
        'PDF', 
        save_all=True, 
        append_images=pil_images[1:] if len(pil_images) > 1 else []
    )
    
    return pdf_buffer.getvalue()



@router.post("/generate-catalog")
async def generate_master_catalog(
    # Basic fields
    category: CategoryEnum = Form(...),
    collection_name: str = Form(...),
    collection_number: str = Form(""),  # Original field name from frontend
    theme: str = Form("studio_minimal"),
    
    # Model appearance
    skin_tone: str = Form("fair"),
    body_type: str = Form(""),
    
    # Quality
    image_quality: str = Form("4K"),
    
    # Images
    front_images: List[UploadFile] = File(...),
    back_images: List[UploadFile] = File(...),
    logo: Optional[UploadFile] = File(None),
    products_metadata: Optional[str] = Form(None)
):
    """Generate enhanced Master Catalog with smart layout distribution or manual selection"""
    
    if len(front_images) != len(back_images):
        raise HTTPException(status_code=400, detail="Number of front and back images must match")
    
    if len(front_images) < 1 or len(front_images) > 20: # Allow up to 20 now
        raise HTTPException(status_code=400, detail="Provide 1-20 products")
    
    num_products = len(front_images)
    
    # Parse quality selection - 5 options:
    # 1K          = Generate at 1K, no upscale
    # 2K          = Generate at 2K pure, no upscale
    # 4K          = Generate at 4K pure, no upscale
    # 2K_UPSCALE  = Generate at 2K, upscale to 4K
    # 4K_UPSCALE  = Generate at 4K, upscale to 8K
    
    if image_quality == "2K_UPSCALE":
        internal_quality = "2K"
        should_upscale = True
        upscale_target = "4K"
    elif image_quality == "4K_UPSCALE":
        internal_quality = "4K"
        should_upscale = True
        upscale_target = "8K"
    else:
        # Pure modes: 1K, 2K, 4K - use directly, no upscale
        internal_quality = image_quality
        should_upscale = False
        upscale_target = None
    
    print(f"📊 Catalog: {num_products} products, theme: {theme}")
    print(f"🎨 Quality: {image_quality} (generate: {internal_quality}, upscale: {should_upscale})")
    
    # Parse metadata if present
    metadata_map = {}
    if products_metadata:
        import json
        try:
            meta_list = json.loads(products_metadata)
            # Store ALL metadata per product (views, theme, layout)
            metadata_map = {m['index']: m for m in meta_list}
            print(f"📋 Manual view selection loaded for {len(metadata_map)} products")
        except Exception as e:
            print(f"⚠️ Failed to parse products_metadata: {e}")
    
    # Define text_content for poster generation (empty dict if not provided)
    text_content = {}
    
    try:
        gemini = GeminiClient()
        processor = ImageProcessor()
        
        # Read uploads
        front_data = [await f.read() for f in front_images]
        back_data = [await b.read() for b in back_images]
        logo_data = await logo.read() if logo else None
        
        # Preprocess garments
        front_processed = [processor.prepare_garment(f) for f in front_data]
        back_processed = [processor.prepare_garment(b) for b in back_data]
        
        generated_images = []
        
        # ========== 1. COVER PAGE ==========
        print("Generating enhanced cover page...")
        cover = await gemini.generate_catalog_cover_enhanced(
            logo_image=logo_data,
            collection_name=collection_name,
            style_number=collection_number,  # Use collection_number from frontend
            theme=theme,
            image_quality=internal_quality  # Use 2K internally
        )
        generated_images.append(("00_cover.png", cover))
        
        # ========== 2. PRODUCT PAGES ==========
        page_plan = []
        
        if metadata_map:
            # MANUAL PLANNING (Enhanced with Theme & Layout)
            print("Using manual page planning with per-product settings...")
            page_counter = 1
            
            for idx in range(num_products):
                # Parse metadata
                meta = metadata_map.get(idx, {})
                views = meta.get('views', {'front': True, 'back': True, 'detail': False})
                p_theme = meta.get('theme', 'default')
                p_layout = meta.get('layout', 'smart_auto')
                
                # Resolve effective theme
                effective_theme = theme if p_theme == 'default' else p_theme
                
                # Construct page entry kwargs
                base_args = {
                    'theme': effective_theme,
                    'page_number': page_counter
                }
                
                # --- LOGIC for Layout Selection ---
                
                # 1. SPECIAL LAYOUTS (Poster styles forced as Single Front)
                # If explicit poster layout is chosen, force a Single Front page with that layout style
                if p_layout not in ['smart_auto', 'collage', 'single_front', 'single_back', 'fabric_detail']:
                    # It's a creative layout (e.g., hero_bottom, magazine_cover)
                    # We treat this as a "Single View (Front)" but pass the layout_style
                    page_plan.append(('single_v2', idx, {
                        **base_args,
                        'view': 'front', 
                        'layout_style': p_layout  # Pass the specific layout request
                    }))
                    page_counter += 1
                    
                    # If they also wanted Back/Detail, add them as standard pages? 
                    # Let's say yes, if checked.
                    if views.get('back'):
                        page_plan.append(('single_v2', idx, {**base_args, 'view': 'back', 'page_number': page_counter}))
                        page_counter += 1
                    if views.get('detail'):
                        page_plan.append(('fabric_v2', idx, {**base_args, 'page_number': page_counter}))
                        page_counter += 1
                        
                    continue # Done with this product

                # 2. STANDARD STRUCTURAL LAYOUTS
                
                # Explicit Collage
                if p_layout == 'collage':
                    if views.get('front') and views.get('back'):
                         page_plan.append(('collage', idx, base_args.copy()))
                         page_counter += 1
                    else:
                        # Fallback if missing images: just show what we have
                         if views.get('front'): page_plan.append(('single_v2', idx, {**base_args, 'view': 'front'}))
                         if views.get('back'): page_plan.append(('single_v2', idx, {**base_args, 'view': 'back'}))
                         page_counter += 1 # Rough increment

                # Explicit Single Views
                elif p_layout == 'single_front':
                    if views.get('front'):
                        page_plan.append(('single_v2', idx, {**base_args, 'view': 'front'}))
                        page_counter += 1
                
                elif p_layout == 'single_back':
                     if views.get('back'):
                        page_plan.append(('single_v2', idx, {**base_args, 'view': 'back'}))
                        page_counter += 1

                elif p_layout == 'editorial_print':
                    # Editorial Print - product only, no model, highlighting the print
                    page_plan.append(('editorial_print', idx, base_args.copy()))
                    page_counter += 1

                elif p_layout == 'fabric_detail':
                    if views.get('detail') or views.get('front'): # Fallback to front if detail missing? No, logic implies we generate it from front
                        page_plan.append(('fabric_v2', idx, base_args.copy()))
                        page_counter += 1

                # 3. SMART AUTO (Default)
                else: 
                    # If Front + Back -> Collage (efficient & premium)
                    if views.get('front') and views.get('back'):
                        page_plan.append(('collage', idx, base_args.copy()))
                        page_counter += 1
                    elif views.get('front'):
                        page_plan.append(('single_v2', idx, {**base_args, 'view': 'front'}))
                        page_counter += 1
                    elif views.get('back'):
                        page_plan.append(('single_v2', idx, {**base_args, 'view': 'back'}))
                        page_counter += 1
                    
                    if views.get('detail'):
                        # Increment page for fabric shot
                        page_plan.append(('fabric_v2', idx, {**base_args, 'page_number': page_counter}))
                        page_counter += 1
                    
        else:
            # SMART PLANNING (Legacy/Default)
            print("Using smart page planning...")
            page_plan = plan_catalog_pages(num_products, max_pages=10)
            
        print(f"Page plan: {len(page_plan)} content pages")
        
        for page_num, (layout_type, prod_idx, extra) in enumerate(page_plan, start=1):
            print(f"Page {page_num}/{len(page_plan)}: {layout_type} for product {prod_idx + 1}")
            
            # Extract per-page theme if specified, else use global theme
            p_theme = extra.get('theme', theme)
            
            try:
                # Get images for this product (use raw bytes or processed)
                f_raw = front_data[prod_idx]
                b_raw = back_data[prod_idx]
                
                # Use processed versions if available, fallback to raw bytes
                f_proc = front_processed[prod_idx] if prod_idx < len(front_processed) else f_raw
                b_proc = back_processed[prod_idx] if prod_idx < len(back_processed) else b_raw
                if layout_type == 'collage':
                    # V2: Creative collage layout (front + back)
                    page_number = extra.get('page_number', page_num)
                    # Collage of Front + Back
                    page = await gemini.generate_collage_layout(
                        front_image=f_proc,
                        back_image=b_proc,
                        category=category,
                        skin_tone=skin_tone,
                        body_type=body_type,
                        theme=p_theme,
                        page_number=page_num,
                        image_quality=internal_quality
                    )
                    
                elif layout_type == 'single_v2':
                    # Single View Page
                    view = extra.get('view', 'front')
                    target_image = f_proc if view == 'front' else b_proc
                    
                    # Check if a specific CREATIVE LAYOUT was requested
                    layout_style = extra.get('layout_style')
                    
                    if layout_style:
                        print(f"   Using explicit layout style: {layout_style}")
                        # Use Marketing Poster generator for specific layouts
                        # Construct a text content dict for the poster
                        poster_text = {
                            "brand": collection_name,
                            "tagline": text_content.get('tagline', ''),
                            "season": text_content.get('season', '')
                        }
                        
                        page = await gemini.generate_marketing_poster(
                            garment_image=target_image,
                            logo_image=logo_data,
                            category=category,
                            skin_tone=skin_tone,
                            body_type=body_type,
                            marketing_theme=p_theme, # Uses 'marketing_theme' arg name
                            layout_style=layout_style,
                            text_content=poster_text,
                            image_quality=internal_quality
                        )
                    else:
                        # Use Standard Catalog Page generator (Smart Auto / Default)
                        page = await gemini.generate_catalog_product_page_v2(
                            garment_image=target_image,
                            category=category,
                            view=view,
                            skin_tone=skin_tone,
                            body_type=body_type,
                            theme=p_theme,
                            page_number=page_num, # Used for variety rotation
                            total_pages=len(page_plan),
                            image_quality=internal_quality
                        )

                elif layout_type == 'fabric_v2':
                    # Fabric Detail Shot
                    # Use Front image as source for fabric
                    page = await gemini.generate_fabric_closeup_v2(
                        garment_image=f_proc,
                        theme=p_theme,
                        page_number=page_num,
                        image_quality=internal_quality
                    )

                elif layout_type == 'editorial_print':
                    # Editorial Print - product shot highlighting the print, no model
                    page = await gemini.generate_editorial_print(
                        garment_image=f_proc,
                        theme=p_theme,
                        page_number=page_num,
                        image_quality=internal_quality
                    )

                # Legacy fallback for old layout types
                elif layout_type == 'combo':
                    page = await gemini.generate_combo_layout(
                        front_image=front_processed[prod_idx],
                        back_image=back_processed[prod_idx],
                        logo_image=logo_data,
                        category=category,
                        skin_tone=skin_tone,
                        body_type=body_type,
                        theme=theme,
                        collection_name=collection_name,
                        image_quality=internal_quality
                    )
                
                elif layout_type in ['front', 'back']:
                    view = layout_type
                    garment = front_processed[prod_idx] if view == 'front' else back_processed[prod_idx]
                    page = await gemini.generate_catalog_product_page_v2(
                        garment_image=garment,
                        category=category,
                        view=view,
                        skin_tone=skin_tone,
                        body_type=body_type,
                        theme=theme,
                        page_number=page_num,
                        total_pages=len(page_plan),
                        image_quality=internal_quality
                    )

                # Consolidate success handling
                if page:
                    filename = f"{page_num:02d}_{layout_type}_product_{prod_idx + 1}.png"
                    generated_images.append((filename, page))
                    print(f"✅ Page {page_num} generated.")
                else:
                    print(f"⚠️ Page {page_num} failed to generate.")
                    
            except Exception as e:
                print(f"Failed to generate {layout_type} for product {prod_idx + 1}: {e}")
                import traceback
                traceback.print_exc()
                # Continue with other pages
                continue
        
        # ========== 3. THANK YOU PAGE ==========
        print("Generating thank you page...")
        thankyou = await gemini.generate_catalog_thankyou_simple(
            logo_image=logo_data,
            collection_name=collection_name,
            theme=theme,
            image_quality=internal_quality  # Use 2K internally
        )
        generated_images.append(("99_thankyou.png", thankyou))
        
        print(f"Generated {len(generated_images)} images")
        
        # ========== 4. UPSCALE IF NEEDED ==========
        if should_upscale:
            print(f"📐 Upscaling images to {upscale_target}...")
            upscaled_images = []
            for filename, image_bytes in generated_images:
                try:
                    upscaled = upscale_to_target(image_bytes, upscale_target)
                    upscaled_images.append((filename, upscaled))
                except Exception as upscale_error:
                    print(f"⚠️ Upscale failed for {filename}: {upscale_error}")
                    upscaled_images.append((filename, image_bytes))  # Use original
            generated_images = upscaled_images
            print(f"✅ Upscaled {len(generated_images)} images to {upscale_target}")
        
        print("Creating ZIP and PDF...")
        
        # ========== 5. CREATE PDF ==========
        print("Creating PDF from images...")
        try:
            image_bytes_only = [img_bytes for _, img_bytes in generated_images]
            pdf_bytes = create_pdf_from_images(image_bytes_only)
            print(f"PDF created: {len(pdf_bytes)} bytes")
        except Exception as pdf_error:
            print(f"PDF creation failed: {pdf_error}")
            pdf_bytes = None
        
        # ========== 5. CREATE ZIP WITH IMAGES + PDF ==========
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            for filename, image_bytes in generated_images:
                print(f"Adding: {filename} ({len(image_bytes)} bytes)")
                zf.writestr(filename, image_bytes)
            
            # Add PDF if created successfully
            if pdf_bytes:
                pdf_filename = f"{collection_name or 'catalog'}_complete.pdf"
                safe_pdf_name = "".join(c for c in pdf_filename if c.isalnum() or c in ' -_.').strip()
                zf.writestr(safe_pdf_name, pdf_bytes)
                print(f"Added PDF: {safe_pdf_name}")
        
        zip_buffer.seek(0)
        
        safe_name = "".join(c for c in collection_name if c.isalnum() or c in ' -_').strip() or "catalog"
        
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={
                "Content-Disposition": f'attachment; filename="{safe_name}_catalog.zip"'
            }
        )
        
    except Exception as e:
        print(f"Catalog generation failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Catalog generation failed: {str(e)}")


# ============================================
# POSE VARIATIONS ENDPOINT
# ============================================

# Available poses for frontend
POSE_OPTIONS = {
    "catalog_standard": "Classic Standing",
    "hands_on_hips": "Hands on Hips", 
    "arms_crossed": "Arms Crossed",
    "hands_in_pockets": "Hands in Pockets",
    "walking": "Walking",
    "walking_towards": "Walking Towards Camera",
    "sitting_chair": "Sitting on Chair",
    "sitting_stool": "Sitting on Stool",
    "leaning_wall": "Leaning on Wall",
    "crouching": "Crouching",
    "editorial_dramatic": "Editorial Dramatic",
    "editorial_relaxed": "Editorial Relaxed"
}


@router.get("/poses")
async def get_available_poses():
    """Get list of available pose options for frontend"""
    return {"poses": POSE_OPTIONS}


@router.post("/regenerate-pose")
async def regenerate_pose(
    original_image: UploadFile = File(...),
    pose_type: str = Form(...),
    category: str = Form("men"),
    skin_tone: str = Form("medium"),
    image_quality: str = Form("4K")
):
    """
    Regenerate an image with a different pose while keeping clothing identical.
    
    - original_image: The previously generated image
    - pose_type: Key from POSE_OPTIONS (e.g., 'hands_on_hips')
    - category: Model category (men, women, etc.)
    - skin_tone: Skin tone preference
    - image_quality: Output quality (1K, 2K, 4K)
    """
    
    if pose_type not in POSE_OPTIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid pose_type. Available: {list(POSE_OPTIONS.keys())}"
        )
    
    try:
        # Read original image
        original_bytes = await original_image.read()
        
        print(f"🔄 Regenerating with pose: {pose_type}")
        print(f"   Category: {category}, Quality: {image_quality}")
        
        # Create Gemini client
        client = GeminiClient()
        
        # Generate with new pose
        result_bytes = await client.regenerate_with_pose(
            original_image_bytes=original_bytes,
            pose_type=pose_type,
            category=category,
            skin_tone=skin_tone,
            image_quality=image_quality
        )
        
        if not result_bytes:
            raise HTTPException(status_code=500, detail="Failed to regenerate image with new pose")
        
        print(f"✅ Pose regeneration complete: {len(result_bytes)} bytes")
        
        # Return as PNG image
        return StreamingResponse(
            io.BytesIO(result_bytes),
            media_type="image/png",
            headers={
                "Content-Disposition": f'attachment; filename="pose_{pose_type}.png"'
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Pose regeneration failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Pose regeneration failed: {str(e)}")


# ============================================
# VIDEO GENERATION ENDPOINT
# ============================================

@router.post("/generate-video")
async def generate_video(
    image: UploadFile = File(...),
    product_desc: str = Form(...),
    effect: str = Form("snap"),  # snap, walk, macro
    model_type: str = Form("fast"), # fast, standard
    duration: int = Form(5)
):
    """
    Generate a catchy video clip from an image using Veo 3.1.
    """
    try:
        # Validate inputs
        valid_effects = ['snap', 'walk', 'macro']
        valid_model_types = ['fast', 'standard']
        
        if effect not in valid_effects:
            raise HTTPException(status_code=400, detail=f"Invalid effect. Must be one of: {valid_effects}")
        if model_type not in valid_model_types:
            raise HTTPException(status_code=400, detail=f"Invalid model_type. Must be one of: {valid_model_types}")
        if duration < 4 or duration > 8:
            raise HTTPException(status_code=400, detail="Duration must be between 4 and 8 seconds")
        
        # Read image bytes
        image_bytes = await image.read()
        
        if len(image_bytes) > 20 * 1024 * 1024:  # 20MB limit
            raise HTTPException(status_code=400, detail="Image file too large (max 20MB)")
        
        # Initialize VideoService
        video_service = VideoService()
        
        # Get catchy prompt based on effect
        prompt = video_service.get_catchy_prompt(product_desc, effect)
        
        print(f"🎬 Generating video for: {product_desc}")
        print(f"   Effect: {effect}, Model: {model_type}, Duration: {duration}s")
        
        # Generate video (this polls until complete)
        video_bytes = await video_service.generate_fashion_clip(
            image_bytes=image_bytes,
            prompt=prompt,
            model_type=model_type,
            duration_seconds=duration
        )
        
        if not video_bytes:
            raise HTTPException(status_code=500, detail="Video generation failed or timed out")
            
        # Return as MP4
        return StreamingResponse(
            io.BytesIO(video_bytes),
            media_type="video/mp4",
            headers={
                "Content-Disposition": f'attachment; filename="bono_clip_{effect}.mp4"'
            }
        )
        
    except Exception as e:
        print(f"Video generation failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Video generation failed: {str(e)}")


# ============================================
# BOTTOMS CATALOG GENERATION ENDPOINT
# ============================================

@router.post("/generate-bottoms-catalog")
async def generate_bottoms_catalog(
    logo: Optional[UploadFile] = File(None),
    brand_name: str = Form(...),
    collection_name: str = Form(...),
    products: str = Form(...),  # JSON string: [{"article": "ABC123", "name": "Blue Jogger", "sizes": "0-6M, 6-12M", "image_index": 0}]
    product_images: List[UploadFile] = File(...),
    cover_style: str = Form("minimal_elegant"),
    include_detail_pages: bool = Form(True),
    season: str = Form("2026")
):
    """
    Generate a complete baby bottoms/joggers catalog.
    
    Features:
    - Professional cover page with brand logo
    - Product pages with toddler models wearing the joggers
    - Optional fabric detail pages
    - Thank you/closing page
    - Non-repetitive taglines and varied layouts
    - 100% garment preservation guaranteed
    """
    import json
    
    try:
        # Parse products JSON
        products_list = json.loads(products)
        print(f"📦 Generating bottoms catalog for {len(products_list)} products")
        print(f"   Brand: {brand_name}, Collection: {collection_name}")
        
        # Read all product images
        product_image_bytes = []
        for img in product_images:
            product_image_bytes.append(await img.read())
        
        # Read logo if provided
        logo_bytes = None
        if logo:
            logo_bytes = await logo.read()
        
        # Initialize service
        bottoms_service = BottomsCatalogService()
        generated_pages = []
        
        # 1. Generate Cover Page
        print("🎨 Generating cover page...")
        try:
            cover_page = await bottoms_service.generate_cover_page(
                logo_image=logo_bytes,
                collection_name=collection_name,
                brand_name=brand_name,
                products_list=products_list,
                season=season,
                style=cover_style
            )
            generated_pages.append(("00_cover.png", cover_page))
            print("   ✓ Cover page generated")
        except Exception as e:
            print(f"   ✗ Cover page failed: {e}")
        
        # 2. Generate Product Pages (each product gets: front, back, print closeup, fabric aesthetic)
        for idx, product in enumerate(products_list):
            print(f"📷 Generating product {idx + 1}/{len(products_list)}: {product.get('name', 'Unknown')}")
            
            # Get corresponding image
            image_index = product.get('image_index', idx)
            if image_index >= len(product_image_bytes):
                image_index = idx % len(product_image_bytes)
            
            # Get view preferences
            views = product.get('views', {})
            # Defaults if views not provided (fallback logic)
            show_front = views.get('front', True)
            show_back = views.get('back', True)
            show_print = views.get('print', True)
            show_fabric = views.get('fabric', idx == 0 or include_detail_pages) # Partial fallback
            
            jogger_image = product_image_bytes[image_index]
            article_num = product.get('article', f'ART-{idx+1:03d}')
            product_name = product.get('name', f'Product {idx + 1}')
            
            try:
                # A. Front product page with model
                if show_front:
                    product_page = await bottoms_service.generate_product_page(
                        jogger_image=jogger_image,
                        article_number=article_num,
                        product_name=product_name,
                        sizes=product.get('sizes', 'S, M, L'),
                        minimal_text=True  # Clean look requested
                    )
                    generated_pages.append((f"{idx + 1:02d}a_front_{article_num}.png", product_page))
                    print(f"   ✓ Front view page generated")
                
                # B. Back view page (SOLID COLOR - no print)
                if show_back:
                    back_page = await bottoms_service.generate_back_view_page(
                        jogger_image=jogger_image,
                        article_number=article_num,
                        product_name=product_name
                    )
                    generated_pages.append((f"{idx + 1:02d}b_back_{article_num}.png", back_page))
                    print(f"   ✓ Back view page generated (solid color)")
                
                # C. Print/graphic close-up page
                if show_print:
                    print_page = await bottoms_service.generate_print_closeup_page(
                        jogger_image=jogger_image,
                        product_name=product_name
                    )
                    generated_pages.append((f"{idx + 1:02d}c_print_{article_num}.png", print_page))
                    print(f"   ✓ Print close-up page generated")
                
                # D. Fabric aesthetic shot
                if show_fabric:
                    fabric_page = await bottoms_service.generate_fabric_aesthetic_page(
                        jogger_image=jogger_image,
                        product_name=product_name
                    )
                    generated_pages.append((f"{idx + 1:02d}d_fabric_{article_num}.png", fabric_page))
                    print(f"   ✓ Fabric aesthetic page generated")
                    
            except Exception as e:
                print(f"   ✗ Failed for product {idx + 1}: {e}")
                import traceback
                traceback.print_exc()
                continue
        
        # 3. Generate Thank You Page
        print("💝 Generating thank you page...")
        try:
            thank_you_page = await bottoms_service.generate_thank_you_page(
                brand_name=brand_name
            )
            generated_pages.append(("99_thank_you.png", thank_you_page))
            print("   ✓ Thank you page generated")
        except Exception as e:
            print(f"   ✗ Thank you page failed: {e}")
        
        if not generated_pages:
            raise HTTPException(status_code=500, detail="No pages were generated")
        
        # 4. Create both ZIP and PDF
        print(f"📁 Creating catalog with {len(generated_pages)} pages...")
        
        # Create ZIP with PNG images
        zip_buffer = io.BytesIO()
        pil_images = []  # For PDF
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            for filename, image_bytes in generated_pages:
                # Convert to PNG
                img = Image.open(io.BytesIO(image_bytes))
                if img.mode == 'RGBA':
                    img = img.convert('RGB')
                pil_images.append(img)
                
                png_buffer = io.BytesIO()
                img.save(png_buffer, format='PNG', quality=95)
                zf.writestr(f"{collection_name.replace(' ', '_')}/images/{filename}", png_buffer.getvalue())
            
            # Create PDF from images
            print("📄 Creating PDF catalog...")
            if pil_images:
                pdf_buffer = io.BytesIO()
                first_img = pil_images[0]
                rest_imgs = pil_images[1:] if len(pil_images) > 1 else []
                
                first_img.save(
                    pdf_buffer, 
                    format='PDF', 
                    save_all=True, 
                    append_images=rest_imgs,
                    resolution=150.0
                )
                pdf_buffer.seek(0)
                zf.writestr(f"{collection_name.replace(' ', '_')}/{brand_name}_catalog.pdf", pdf_buffer.getvalue())
                print("   ✓ PDF created")
        
        zip_buffer.seek(0)
        
        print(f"✅ Catalog generated successfully! ({len(generated_pages)} pages + PDF)")
        
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={
                "Content-Disposition": f'attachment; filename="{brand_name}_{collection_name}_catalog.zip"'
            }
        )
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid products JSON: {str(e)}")
    except Exception as e:
        print(f"Bottoms catalog generation failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Catalog generation failed: {str(e)}")

