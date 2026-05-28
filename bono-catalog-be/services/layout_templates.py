"""
Layout Templates Service
Creates professional catalog layouts with text overlays on generated images.
"""

from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
from io import BytesIO
from typing import Optional, Dict, Tuple
import os

# Colors for themes
THEME_COLORS = {
    "clean_white": {"bg": "#FFFFFF", "text": "#1A1A1A", "accent": "#333333"},
    "soft_neutral": {"bg": "#FAF8F5", "text": "#4A3728", "accent": "#8B7355"},
    "dark_luxe": {"bg": "#1A1A1A", "text": "#FFFFFF", "accent": "#D4AF37"},
    "summer_vibes": {"bg": "#FFF9E6", "text": "#333333", "accent": "#FF6B6B"},
    "winter_frost": {"bg": "#F0F8FF", "text": "#1A3A5C", "accent": "#4A90D9"},
    "autumn_warm": {"bg": "#FDF5E6", "text": "#4A2C00", "accent": "#D2691E"},
    "spring_bloom": {"bg": "#FFF0F5", "text": "#2D5016", "accent": "#81C784"},
    "urban_street": {"bg": "#E0E0E0", "text": "#1A1A1A", "accent": "#FF5722"},
    "retro_90s": {"bg": "#FFEB3B", "text": "#1A1A1A", "accent": "#E91E63"},
    "premium_editorial": {"bg": "#FAFAFA", "text": "#212121", "accent": "#757575"},
    "playful_kids": {"bg": "#FFF8E1", "text": "#333333", "accent": "#FF7043"},
    "ethnic_festive": {"bg": "#FDF5E6", "text": "#8B0000", "accent": "#FFD700"},
    "neon_night": {"bg": "#0D0D0D", "text": "#FFFFFF", "accent": "#FF00FF"},
    "bohemian": {"bg": "#F5EBE0", "text": "#4A2C00", "accent": "#6B4423"},
    "varsity_sports": {"bg": "#FFFFFF", "text": "#1565C0", "accent": "#F44336"},
    "maximalist_glam": {"bg": "#1A1A1A", "text": "#FFD700", "accent": "#8E24AA"}
}


def get_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    """Get font with fallback"""
    font_paths = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SF-Pro-Display-Bold.otf" if bold else "/System/Library/Fonts/SF-Pro-Display-Regular.otf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    
    for path in font_paths:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size)
            except:
                continue
    
    return ImageFont.load_default()


def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


class LayoutTemplates:
    """
    Professional catalog layout templates.
    Applies text overlays, branding, and pricing to generated images.
    """
    
    # Layout types
    LAYOUT_MINIMAL = "minimal"           # Small text footer
    LAYOUT_SIDEBAR = "sidebar"           # Side panel with info
    LAYOUT_OVERLAY = "overlay"           # Text overlaid on image
    LAYOUT_MAGAZINE = "magazine"         # Editorial style
    
    @staticmethod
    def apply_layout(
        image_bytes: bytes,
        layout_type: str = "minimal",
        theme_id: str = "clean_white",
        product_name: str = "",
        product_number: str = "",
        price: str = "",
        keywords: str = "",
        logo_bytes: Optional[bytes] = None,
        brand_name: str = ""
    ) -> bytes:
        """
        Apply layout template to generated image.
        
        Args:
            image_bytes: The raw AI-generated image
            layout_type: Type of layout to apply
            theme_id: Theme for colors
            product_name: Name of the product
            product_number: Product/SKU number
            price: Price to display
            keywords: Marketing keywords
            logo_bytes: Brand logo image
            brand_name: Brand name text fallback
        
        Returns:
            Image bytes with layout applied
        """
        # Open the image
        img = Image.open(BytesIO(image_bytes))
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Get theme colors
        colors = THEME_COLORS.get(theme_id, THEME_COLORS["clean_white"])
        bg_color = hex_to_rgb(colors["bg"])
        text_color = hex_to_rgb(colors["text"])
        accent_color = hex_to_rgb(colors["accent"])
        
        # Apply the appropriate layout
        if layout_type == "sidebar":
            result = LayoutTemplates._apply_sidebar(
                img, text_color, accent_color, bg_color,
                product_name, product_number, price, keywords, logo_bytes, brand_name
            )
        elif layout_type == "overlay":
            result = LayoutTemplates._apply_overlay(
                img, text_color, accent_color,
                product_name, product_number, price
            )
        elif layout_type == "magazine":
            result = LayoutTemplates._apply_magazine(
                img, text_color, accent_color, bg_color,
                product_name, product_number, price, keywords
            )
        else:  # minimal
            result = LayoutTemplates._apply_minimal(
                img, text_color, accent_color, bg_color,
                product_name, product_number, price, logo_bytes, brand_name
            )
        
        # Convert back to bytes
        buffer = BytesIO()
        result.save(buffer, format="PNG")
        buffer.seek(0)
        return buffer.getvalue()
    
    @staticmethod
    def _apply_minimal(
        img: Image.Image,
        text_color: Tuple,
        accent_color: Tuple,
        bg_color: Tuple,
        product_name: str,
        product_number: str,
        price: str,
        logo_bytes: Optional[bytes],
        brand_name: str
    ) -> Image.Image:
        """Minimal layout - clean footer strip with info"""
        
        # Calculate footer height (10% of image)
        footer_height = int(img.height * 0.12)
        
        # Create new image with footer
        new_height = img.height + footer_height
        result = Image.new('RGB', (img.width, new_height), color=bg_color)
        result.paste(img, (0, 0))
        
        # Create drawing context
        draw = ImageDraw.Draw(result)
        
        # Fonts
        font_large = get_font(int(footer_height * 0.35), bold=True)
        font_medium = get_font(int(footer_height * 0.25))
        font_small = get_font(int(footer_height * 0.2))
        
        # Starting position
        x_left = int(img.width * 0.05)
        y_center = img.height + (footer_height // 2)
        
        # Product name (left)
        if product_name:
            draw.text(
                (x_left, y_center - int(footer_height * 0.15)),
                product_name.upper(),
                fill=text_color,
                font=font_large
            )
        
        # Product number (under name)
        if product_number:
            draw.text(
                (x_left, y_center + int(footer_height * 0.15)),
                f"Style: {product_number}",
                fill=accent_color,
                font=font_small
            )
        
        # Price (right side)
        if price:
            price_text = price if price.startswith('₹') else f"₹{price}"
            price_bbox = draw.textbbox((0, 0), price_text, font=font_large)
            price_width = price_bbox[2] - price_bbox[0]
            draw.text(
                (img.width - x_left - price_width, y_center - int(footer_height * 0.15)),
                price_text,
                fill=accent_color,
                font=font_large
            )
        
        # Logo or brand name (top right corner of image)
        if logo_bytes:
            try:
                logo = Image.open(BytesIO(logo_bytes))
                logo_h = int(footer_height * 0.6)
                logo_w = int(logo.width * (logo_h / logo.height))
                logo = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
                if logo.mode == 'RGBA':
                    result.paste(logo, (img.width - logo_w - 20, 20), logo)
                else:
                    result.paste(logo, (img.width - logo_w - 20, 20))
            except:
                pass
        elif brand_name:
            draw.text(
                (img.width - x_left - 100, 20),
                brand_name,
                fill=text_color,
                font=font_medium
            )
        
        return result
    
    @staticmethod
    def _apply_sidebar(
        img: Image.Image,
        text_color: Tuple,
        accent_color: Tuple,
        bg_color: Tuple,
        product_name: str,
        product_number: str,
        price: str,
        keywords: str,
        logo_bytes: Optional[bytes],
        brand_name: str
    ) -> Image.Image:
        """Sidebar layout - info panel on the right"""
        
        # Calculate sidebar width (25% of image)
        sidebar_width = int(img.width * 0.28)
        
        # Create new image with sidebar
        new_width = img.width + sidebar_width
        result = Image.new('RGB', (new_width, img.height), color=bg_color)
        result.paste(img, (0, 0))
        
        draw = ImageDraw.Draw(result)
        
        # Fonts
        font_title = get_font(int(sidebar_width * 0.12), bold=True)
        font_price = get_font(int(sidebar_width * 0.15), bold=True)
        font_body = get_font(int(sidebar_width * 0.08))
        font_small = get_font(int(sidebar_width * 0.06))
        
        # Sidebar center X
        center_x = img.width + (sidebar_width // 2)
        start_y = int(img.height * 0.15)
        
        # Logo at top
        if logo_bytes:
            try:
                logo = Image.open(BytesIO(logo_bytes))
                logo_h = int(sidebar_width * 0.3)
                logo_w = int(logo.width * (logo_h / logo.height))
                logo = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
                logo_x = center_x - (logo_w // 2)
                if logo.mode == 'RGBA':
                    result.paste(logo, (logo_x, 30), logo)
                else:
                    result.paste(logo, (logo_x, 30))
            except:
                pass
        elif brand_name:
            draw.text(
                (center_x, 50),
                brand_name.upper(),
                fill=text_color,
                font=font_title,
                anchor="mm"
            )
        
        # Product name
        if product_name:
            draw.text(
                (center_x, start_y),
                product_name.upper(),
                fill=text_color,
                font=font_title,
                anchor="mm"
            )
            start_y += int(sidebar_width * 0.15)
        
        # Divider line
        draw.line(
            [(img.width + 30, start_y), (new_width - 30, start_y)],
            fill=accent_color,
            width=2
        )
        start_y += 30
        
        # Style number
        if product_number:
            draw.text(
                (center_x, start_y),
                f"STYLE: {product_number}",
                fill=accent_color,
                font=font_body,
                anchor="mm"
            )
            start_y += int(sidebar_width * 0.12)
        
        # Keywords
        if keywords:
            keyword_list = [k.strip() for k in keywords.split(',')[:4]]
            for kw in keyword_list:
                draw.text(
                    (center_x, start_y),
                    f"• {kw.capitalize()}",
                    fill=text_color,
                    font=font_small,
                    anchor="mm"
                )
                start_y += int(sidebar_width * 0.08)
        
        # Price at bottom
        if price:
            price_text = price if price.startswith('₹') else f"₹{price}"
            draw.text(
                (center_x, img.height - int(sidebar_width * 0.25)),
                price_text,
                fill=accent_color,
                font=font_price,
                anchor="mm"
            )
        
        return result
    
    @staticmethod
    def _apply_overlay(
        img: Image.Image,
        text_color: Tuple,
        accent_color: Tuple,
        product_name: str,
        product_number: str,
        price: str
    ) -> Image.Image:
        """Overlay layout - text directly on image with gradient"""
        
        # Create copy
        result = img.copy()
        draw = ImageDraw.Draw(result)
        
        # Create gradient overlay at bottom
        gradient_height = int(img.height * 0.25)
        for i in range(gradient_height):
            alpha = int(180 * (i / gradient_height))
            y = img.height - gradient_height + i
            draw.line(
                [(0, y), (img.width, y)],
                fill=(0, 0, 0, alpha) if len(text_color) > 3 else (0, 0, 0)
            )
        
        # Fonts (white for overlay)
        font_title = get_font(int(img.width * 0.06), bold=True)
        font_price = get_font(int(img.width * 0.08), bold=True)
        font_small = get_font(int(img.width * 0.03))
        
        # Bottom left position
        x_left = int(img.width * 0.05)
        y_bottom = img.height - int(img.height * 0.05)
        
        # Product name
        if product_name:
            draw.text(
                (x_left, y_bottom - int(img.height * 0.12)),
                product_name.upper(),
                fill=(255, 255, 255),
                font=font_title
            )
        
        # Style number
        if product_number:
            draw.text(
                (x_left, y_bottom - int(img.height * 0.05)),
                f"#{product_number}",
                fill=(200, 200, 200),
                font=font_small
            )
        
        # Price (bottom right)
        if price:
            price_text = price if price.startswith('₹') else f"₹{price}"
            price_bbox = draw.textbbox((0, 0), price_text, font=font_price)
            price_width = price_bbox[2] - price_bbox[0]
            draw.text(
                (img.width - x_left - price_width, y_bottom - int(img.height * 0.1)),
                price_text,
                fill=accent_color,
                font=font_price
            )
        
        return result
    
    @staticmethod
    def _apply_magazine(
        img: Image.Image,
        text_color: Tuple,
        accent_color: Tuple,
        bg_color: Tuple,
        product_name: str,
        product_number: str,
        price: str,
        keywords: str
    ) -> Image.Image:
        """Magazine editorial layout - artistic typography"""
        
        # Add border/margin
        margin = int(img.width * 0.05)
        new_size = (img.width + margin * 2, img.height + margin * 2 + int(img.height * 0.15))
        result = Image.new('RGB', new_size, color=bg_color)
        result.paste(img, (margin, margin))
        
        draw = ImageDraw.Draw(result)
        
        # Fonts
        font_hero = get_font(int(margin * 2.5), bold=True)
        font_sub = get_font(int(margin * 0.8))
        font_price = get_font(int(margin * 1.5), bold=True)
        
        # Text at bottom
        text_y = img.height + margin * 2
        
        # Large product name
        if product_name:
            draw.text(
                (margin, text_y),
                product_name.upper(),
                fill=text_color,
                font=font_hero
            )
        
        # Keywords as tagline
        if keywords:
            tagline = " • ".join([k.strip().capitalize() for k in keywords.split(',')[:3]])
            draw.text(
                (margin, text_y + int(margin * 2.8)),
                tagline,
                fill=accent_color,
                font=font_sub
            )
        
        # Price on right
        if price:
            price_text = price if price.startswith('₹') else f"₹{price}"
            price_bbox = draw.textbbox((0, 0), price_text, font=font_price)
            price_width = price_bbox[2] - price_bbox[0]
            draw.text(
                (new_size[0] - margin - price_width, text_y + int(margin * 0.5)),
                price_text,
                fill=accent_color,
                font=font_price
            )
        
        return result


# Convenience function
def apply_catalog_layout(
    image_bytes: bytes,
    theme_id: str = "clean_white",
    product_name: str = "",
    product_number: str = "",
    price: str = "",
    keywords: str = "",
    logo_bytes: Optional[bytes] = None,
    brand_name: str = "",
    layout_type: str = "minimal"
) -> bytes:
    """Apply catalog layout to an image"""
    return LayoutTemplates.apply_layout(
        image_bytes=image_bytes,
        layout_type=layout_type,
        theme_id=theme_id,
        product_name=product_name,
        product_number=product_number,
        price=price,
        keywords=keywords,
        logo_bytes=logo_bytes,
        brand_name=brand_name
    )
