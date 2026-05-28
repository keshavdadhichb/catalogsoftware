"""
Pro Catalog API Routes
B2B endpoints for professional catalog generation
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from typing import List, Optional
import json
import os
import uuid
from datetime import datetime
from pathlib import Path
import asyncio

router = APIRouter(prefix="/api/pro", tags=["pro-catalog"])

# Import services
from services.email_service import email_service

# Job storage (in production, use a database)
if os.getenv("VERCEL"):
    JOBS_DIR = Path("/tmp/pro_jobs")
    RESULTS_DIR = Path("/tmp/pro_results")
else:
    JOBS_DIR = Path("pro_jobs")
    RESULTS_DIR = Path("pro_results")

JOBS_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)


def get_job_path(job_id: str) -> Path:
    return JOBS_DIR / f"{job_id}.json"


def save_job(job_id: str, job_data: dict):
    with open(get_job_path(job_id), 'w') as f:
        json.dump(job_data, f, indent=2, default=str)


def load_job(job_id: str) -> dict:
    job_path = get_job_path(job_id)
    if not job_path.exists():
        return None
    with open(job_path, 'r') as f:
        return json.load(f)


def list_jobs(limit: int = 10) -> List[dict]:
    """List recent jobs"""
    jobs = []
    for job_file in sorted(JOBS_DIR.glob("*.json"), key=os.path.getmtime, reverse=True)[:limit]:
        with open(job_file) as f:
            jobs.append(json.load(f))
    return jobs


@router.post("/generate-batch")
async def generate_batch(
    background_tasks: BackgroundTasks,
    client_name: str = Form(...),
    catalog_name: str = Form(...),
    catalog_number: str = Form(""),
    category: str = Form(...),
    age_range: str = Form("[]"),
    theme: str = Form(...),
    setting: str = Form(...),
    language: str = Form("english"),
    include_index: bool = Form(False),
    include_price_list: bool = Form(False),
    include_thank_you: bool = Form(True),
    quality: str = Form("2K"),
    aspect_ratio: str = Form("a4_portrait"),
    output_format: str = Form("both"),
    output_style: str = Form("simple"),  # 'simple' or 'layout'
    generation_mode: str = Form("batch"),
    products_metadata: str = Form("[]"),
    front_images: List[UploadFile] = File(...),
    back_images: List[UploadFile] = File(...),
    logo: Optional[UploadFile] = File(None)
):
    """Submit a batch catalog generation job"""
    try:
        job_id = str(uuid.uuid4())[:8]
        
        # Parse metadata
        products_meta = json.loads(products_metadata)
        age_range_parsed = json.loads(age_range)
        
        # Save uploaded images
        job_dir = RESULTS_DIR / job_id
        job_dir.mkdir(exist_ok=True)
        
        images_dir = job_dir / "images"
        images_dir.mkdir(exist_ok=True)
        
        # Save front images
        front_paths = []
        for i, img in enumerate(front_images):
            content = await img.read()
            if len(content) > 0:  # Skip empty placeholders
                path = images_dir / f"front_{i}.png"
                with open(path, 'wb') as f:
                    f.write(content)
                front_paths.append(str(path))
            else:
                front_paths.append(None)
        
        # Save back images
        back_paths = []
        for i, img in enumerate(back_images):
            content = await img.read()
            if len(content) > 0 and not img.filename.endswith('_placeholder.png'):
                path = images_dir / f"back_{i}.png"
                with open(path, 'wb') as f:
                    f.write(content)
                back_paths.append(str(path))
            else:
                back_paths.append(None)
        
        # Save logo
        logo_path = None
        if logo:
            logo_content = await logo.read()
            if len(logo_content) > 0:
                logo_path = str(images_dir / "logo.png")
                with open(logo_path, 'wb') as f:
                    f.write(logo_content)
        
        # Create job record
        job_data = {
            "job_id": job_id,
            "status": "pending",
            "created_at": datetime.now().isoformat(),
            "client_name": client_name,
            "catalog_name": catalog_name,
            "catalog_number": catalog_number,
            "category": category,
            "age_range": age_range_parsed,
            "theme": theme,
            "setting": setting,
            "language": language,
            "include_index": include_index,
            "include_price_list": include_price_list,
            "include_thank_you": include_thank_you,
            "quality": quality,
            "aspect_ratio": aspect_ratio,
            "output_format": output_format,
            "output_style": output_style,
            "products_metadata": products_meta,
            "front_paths": front_paths,
            "back_paths": back_paths,
            "logo_path": logo_path,
            "total_pages": sum(len(p.get('pageTypes', [])) for p in products_meta) + 1 + (1 if include_index else 0) + (1 if include_price_list else 0) + (1 if include_thank_you else 0),
            "completed_pages": 0,
            "failed_pages": 0,
            "download_link": None,
            "error": None
        }
        
        save_job(job_id, job_data)
        
        # Start background processing
        background_tasks.add_task(process_batch_job, job_id)
        
        return JSONResponse({
            "success": True,
            "job_id": job_id,
            "message": "Batch job submitted successfully"
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-true-batch")
async def generate_true_batch(
    background_tasks: BackgroundTasks,
    client_name: str = Form(...),
    catalog_name: str = Form(...),
    catalog_number: str = Form(""),
    category: str = Form(...),
    age_range: str = Form("[]"),
    theme: str = Form(...),
    setting: str = Form(...),
    language: str = Form("english"),
    include_index: bool = Form(False),
    include_price_list: bool = Form(False),
    include_thank_you: bool = Form(True),
    quality: str = Form("2K"),
    aspect_ratio: str = Form("a4_portrait"),
    output_format: str = Form("both"),
    output_style: str = Form("simple"),
    products_metadata: str = Form("[]"),
    front_images: List[UploadFile] = File(...),
    back_images: List[UploadFile] = File(...),
    logo: Optional[UploadFile] = File(None)
):
    """
    Submit a TRUE Gemini Batch API job for 50% cost savings.
    Uses async batch processing with up to 24h completion time.
    """
    try:
        job_id = str(uuid.uuid4())[:8]
        
        # Parse metadata
        products_meta = json.loads(products_metadata)
        age_range_parsed = json.loads(age_range)
        
        # Save uploaded images
        job_dir = RESULTS_DIR / job_id
        job_dir.mkdir(exist_ok=True)
        
        images_dir = job_dir / "images"
        images_dir.mkdir(exist_ok=True)
        
        # Save front images
        front_paths = []
        for i, img in enumerate(front_images):
            content = await img.read()
            if len(content) > 0:
                path = images_dir / f"front_{i}.png"
                with open(path, 'wb') as f:
                    f.write(content)
                front_paths.append(str(path))
            else:
                front_paths.append(None)
        
        # Save back images
        back_paths = []
        for i, img in enumerate(back_images):
            content = await img.read()
            if len(content) > 0 and not img.filename.endswith('_placeholder.png'):
                path = images_dir / f"back_{i}.png"
                with open(path, 'wb') as f:
                    f.write(content)
                back_paths.append(str(path))
            else:
                back_paths.append(None)
        
        # Save logo
        logo_path = None
        if logo:
            logo_content = await logo.read()
            if len(logo_content) > 0:
                logo_path = str(images_dir / "logo.png")
                with open(logo_path, 'wb') as f:
                    f.write(logo_content)
        
        # Create job record with true_batch flag
        job_data = {
            "job_id": job_id,
            "status": "pending",
            "mode": "true_batch",  # Flag for true Gemini Batch API
            "created_at": datetime.now().isoformat(),
            "client_name": client_name,
            "catalog_name": catalog_name,
            "catalog_number": catalog_number,
            "category": category,
            "age_range": age_range_parsed,
            "theme": theme,
            "setting": setting,
            "language": language,
            "include_index": include_index,
            "include_price_list": include_price_list,
            "include_thank_you": include_thank_you,
            "quality": quality,
            "aspect_ratio": aspect_ratio,
            "output_format": output_format,
            "output_style": output_style,
            "products_metadata": products_meta,
            "front_paths": front_paths,
            "back_paths": back_paths,
            "logo_path": logo_path,
            "total_pages": sum(len(p.get('pageTypes', [])) for p in products_meta) + 1,
            "completed_pages": 0,
            "failed_pages": 0,
            "gemini_batch_job": None,  # Gemini batch job ID
            "download_link": None,
            "error": None
        }
        
        save_job(job_id, job_data)
        
        # Start true batch processing
        background_tasks.add_task(process_true_batch_job, job_id)
        
        return JSONResponse({
            "success": True,
            "job_id": job_id,
            "mode": "true_batch",
            "message": "True Batch job submitted! Uses Gemini Batch API for 50% savings. May take up to 24 hours."
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


async def process_true_batch_job(job_id: str):
    """
    Process a job using true Gemini Batch API.
    50% cost savings but may take up to 24 hours.
    """
    import asyncio
    
    job = load_job(job_id)
    if not job:
        print(f"[TrueBatch:{job_id}] Job not found")
        return
    
    try:
        job["status"] = "preparing"
        save_job(job_id, job)
        
        print(f"[TrueBatch:{job_id}] Starting true batch processing...")
        
        # Import batch service
        from services.batch_service import (
            GeminiBatchService, 
            BatchJobManager,
            prepare_batch_generation_requests
        )
        from services.pro_generation import ProGenerationService
        
        # Prepare generation requests
        generator = ProGenerationService()
        batch_requests = prepare_batch_generation_requests(job, generator)
        
        print(f"[TrueBatch:{job_id}] Prepared {len(batch_requests)} requests")
        
        if not batch_requests:
            job["status"] = "failed"
            job["error"] = "No valid generation requests prepared"
            save_job(job_id, job)
            return
        
        # Create and submit batch
        batch_manager = BatchJobManager(JOBS_DIR, RESULTS_DIR)
        
        job["status"] = "submitting"
        save_job(job_id, job)
        
        gemini_batch_name = await batch_manager.create_and_submit_batch(
            job_id=job_id,
            generation_requests=batch_requests
        )
        
        job["gemini_batch_job"] = gemini_batch_name
        job["status"] = "processing"
        save_job(job_id, job)
        
        print(f"[TrueBatch:{job_id}] Gemini batch submitted: {gemini_batch_name}")
        
        # Poll for completion
        result = await batch_manager.process_batch_completion(
            job_id=job_id,
            batch_job_name=gemini_batch_name
        )
        
        if result['status'] == 'completed':
            print(f"[TrueBatch:{job_id}] Batch completed with {result.get('count', 0)} images")
            
            # Apply layouts if needed
            if job.get("output_style") == "layout":
                from services.layout_templates import apply_catalog_layout
                output_dir = RESULTS_DIR / job_id / "output"
                
                logo_bytes = None
                if job.get("logo_path") and Path(job["logo_path"]).exists():
                    logo_bytes = Path(job["logo_path"]).read_bytes()
                
                for img_path in result.get('images', []):
                    try:
                        img_bytes = Path(img_path).read_bytes()
                        layout_bytes = apply_catalog_layout(
                            image_bytes=img_bytes,
                            theme_id=job.get("theme", "clean_white"),
                            product_name=job.get("catalog_name", ""),
                            product_number=job.get("catalog_number", ""),
                            logo_bytes=logo_bytes,
                            brand_name=job.get("client_name", "")
                        )
                        Path(img_path).write_bytes(layout_bytes)
                    except Exception as e:
                        print(f"[TrueBatch:{job_id}] Layout error: {e}")
            
            # Create ZIP
            output_dir = RESULTS_DIR / job_id / "output"
            if output_dir.exists():
                import shutil
                zip_path = RESULTS_DIR / f"{job_id}_catalog"
                shutil.make_archive(str(zip_path), 'zip', output_dir)
                
                base_url = os.getenv("PUBLIC_URL", "http://localhost:8000")
                job["download_link"] = f"{base_url}/api/pro/download/{job_id}"
            
            job["status"] = "completed"
            job["completed_pages"] = result.get('count', 0)
            save_job(job_id, job)
            
            # Send email notification
            try:
                await email_service.send_batch_complete_notification(
                    job_id=job_id,
                    catalog_name=job["catalog_name"],
                    client_name=job["client_name"],
                    download_link=job["download_link"],
                    total_pages=job["total_pages"],
                    failed_pages=0  # True batch typically fails entire batch not per page
                )
            except Exception as e:
                print(f"[TrueBatch:{job_id}] Email error: {e}")
            
            print(f"[TrueBatch:{job_id}] ✅ Job completed successfully!")
        else:
            job["status"] = "failed"
            job["error"] = result.get('error', 'Batch processing failed')
            save_job(job_id, job)
            
            # Send failure notification
            try:
                await email_service.send_batch_failed_notification(
                    job_id=job_id,
                    catalog_name=job["catalog_name"],
                    client_name=job["client_name"],
                    error_message=result.get('error', 'Unknown error')
                )
            except Exception as e:
                print(f"[TrueBatch:{job_id}] Email error: {e}")
            
            print(f"[TrueBatch:{job_id}] ❌ Job failed: {result.get('error')}")
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        job["status"] = "failed"
        job["error"] = str(e)
        save_job(job_id, job)
        print(f"[TrueBatch:{job_id}] ❌ Exception: {e}")



async def process_batch_job(job_id: str):
    """Background task to process batch job with ACTUAL image generation"""
    from services.pro_generation import ProGenerationService
    
    job = load_job(job_id)
    if not job:
        return
    
    try:
        job["status"] = "processing"
        save_job(job_id, job)
        
        # Initialize generation service
        generator = ProGenerationService()
        
        job_dir = RESULTS_DIR / job_id
        output_dir = job_dir / "output"
        output_dir.mkdir(exist_ok=True)
        
        generated_images = []
        page_num = 0
        quality = job.get("quality", "2K")
        
        # Get job parameters
        category = job.get("category", "men")
        theme_id = job.get("theme", "clean_white")
        setting_id = job.get("setting", "white_studio")
        age_range = job.get("age_range", [25, 35])
        logo_path = job.get("logo_path")
        
        # Load logo if exists
        logo_bytes = None
        if logo_path and Path(logo_path).exists():
            logo_bytes = Path(logo_path).read_bytes()
        
        # ==========================================
        # STEP 1: GENERATE COVER PAGE
        # ==========================================
        page_num += 1
        print(f"[{job_id}] Generating cover page...")
        try:
            cover_image = await generator.generate_cover_page(
                logo_bytes=logo_bytes,
                catalog_name=job.get("catalog_name", "Catalog"),
                catalog_number=job.get("catalog_number", ""),
                theme_id=theme_id,
                quality=quality
            )
            cover_path = output_dir / f"page_{page_num:03d}_cover.png"
            cover_path.write_bytes(cover_image)
            generated_images.append(str(cover_path))
            print(f"[{job_id}] ✓ Cover page saved")
            job["completed_pages"] += 1
            save_job(job_id, job)
        except Exception as e:
            print(f"[{job_id}] ✗ Cover page failed: {e}")
            job["failed_pages"] += 1
            save_job(job_id, job)
        
        # ==========================================
        # STEP 2: GENERATE INDEX PAGE (if enabled)
        # ==========================================
        if job.get("include_index"):
            page_num += 1
            print(f"[{job_id}] Generating index page...")
            # For now, create a simple placeholder - could be enhanced
            try:
                # Simple index placeholder
                from PIL import Image, ImageDraw, ImageFont
                from io import BytesIO
                
                index_img = Image.new('RGB', (1600, 2000), color='#FFFFFF')
                draw = ImageDraw.Draw(index_img)
                try:
                    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 60)
                except:
                    font = ImageFont.load_default()
                draw.text((100, 100), "INDEX", fill='#333333', font=font)
                
                # Add product thumbnails
                y_pos = 200
                for i, product_meta in enumerate(job["products_metadata"]):
                    front_path = job["front_paths"][i] if i < len(job["front_paths"]) else None
                    if front_path and Path(front_path).exists():
                        try:
                            thumb = Image.open(front_path)
                            thumb = thumb.resize((150, 180), Image.Resampling.LANCZOS)
                            index_img.paste(thumb, (100 + (i % 4) * 180, y_pos + (i // 4) * 220))
                        except:
                            pass
                
                buffer = BytesIO()
                index_img.save(buffer, format="PNG")
                buffer.seek(0)
                
                index_path = output_dir / f"page_{page_num:03d}_index.png"
                index_path.write_bytes(buffer.getvalue())
                generated_images.append(str(index_path))
                print(f"[{job_id}] ✓ Index page saved")
                job["completed_pages"] += 1
                save_job(job_id, job)
            except Exception as e:
                print(f"[{job_id}] ✗ Index page failed: {e}")
                job["failed_pages"] += 1
                save_job(job_id, job)
        
        # ==========================================
        # STEP 3: GENERATE PRODUCT PAGES
        # ==========================================
        for product_idx, product_meta in enumerate(job["products_metadata"]):
            front_path = job["front_paths"][product_idx] if product_idx < len(job["front_paths"]) else None
            back_path = job["back_paths"][product_idx] if product_idx < len(job["back_paths"]) else None
            
            # Load garment images
            front_bytes = None
            back_bytes = None
            
            if front_path and Path(front_path).exists():
                front_bytes = Path(front_path).read_bytes()
            if back_path and Path(back_path).exists():
                back_bytes = Path(back_path).read_bytes()
            
            if not front_bytes:
                print(f"[{job_id}] ⚠ Product {product_idx + 1}: No front image, skipping")
                continue
            
            # Get per-product config
            page_types = product_meta.get("pageTypes", ["front_only"])
            front_pose = product_meta.get("frontPose", "catalog_standard")
            back_pose = product_meta.get("backPose", "catalog_standard")
            keywords = product_meta.get("keywords", "")
            
            # Determine editorial mode
            editorial_mode = job.get("output_style") == "ai_native"
            
            # Generate each selected page type
            for page_type in page_types:
                page_num += 1
                print(f"[{job_id}] Generating page {page_num}: Product {product_idx + 1}, Type: {page_type}")
                
                try:
                    image_bytes = None
                    
                    if page_type == "front_only":
                        image_bytes = await generator.generate_front_only(
                            garment_front=front_bytes,
                            category=category,
                            theme_id=theme_id,
                            setting_id=setting_id,
                            pose_id=front_pose,
                            age_range=age_range,
                            keywords=keywords,
                            quality=quality,
                            editorial_mode=editorial_mode
                        )
                    
                    elif page_type == "back_only":
                        image_bytes = await generator.generate_back_only(
                            garment_back=back_bytes,
                            garment_front=front_bytes,
                            category=category,
                            theme_id=theme_id,
                            setting_id=setting_id,
                            pose_id=back_pose,
                            age_range=age_range,
                            keywords=keywords,
                            quality=quality,
                            editorial_mode=editorial_mode
                        )
                    
                    elif page_type == "front_back_collage":
                        image_bytes = await generator.generate_front_back_collage(
                            garment_front=front_bytes,
                            garment_back=back_bytes or front_bytes,
                            category=category,
                            theme_id=theme_id,
                            setting_id=setting_id,
                            front_pose_id=front_pose,
                            back_pose_id=back_pose,
                            age_range=age_range,
                            keywords=keywords,
                            quality=quality,
                            editorial_mode=editorial_mode
                        )
                    
                    elif page_type == "aesthetic_product":
                        image_bytes = await generator.generate_aesthetic_product(
                            garment_front=front_bytes,
                            theme_id=theme_id,
                            keywords=keywords,
                            quality=quality,
                            editorial_mode=editorial_mode
                        )
                    
                    elif page_type == "hero_closeup":
                        image_bytes = await generator.generate_hero_closeup(
                            garment_front=front_bytes,
                            theme_id=theme_id,
                            quality=quality,
                            editorial_mode=editorial_mode
                        )
                    
                    elif page_type == "fabric_closeup":
                        image_bytes = await generator.generate_fabric_closeup(
                            garment_front=front_bytes,
                            theme_id=theme_id,
                            quality=quality,
                            editorial_mode=editorial_mode
                        )
                    
                    elif page_type == "mega_collage":
                        image_bytes = await generator.generate_mega_collage(
                            garment_front=front_bytes,
                            garment_back=back_bytes or front_bytes,
                            category=category,
                            theme_id=theme_id,
                            setting_id=setting_id,
                            front_pose_id=front_pose,
                            back_pose_id=back_pose,
                            age_range=age_range,
                            keywords=keywords,
                            quality=quality,
                            editorial_mode=editorial_mode
                        )
                    
                    else:
                        # Fallback to front_only for unknown types
                        image_bytes = await generator.generate_front_only(
                            garment_front=front_bytes,
                            category=category,
                            theme_id=theme_id,
                            setting_id=setting_id,
                            pose_id=front_pose,
                            age_range=age_range,
                            keywords=keywords,
                            quality=quality,
                            editorial_mode=editorial_mode
                        )
                    
                    # Save generated image (with layout if enabled)
                    if image_bytes:
                        # Apply layout template if output_style is 'layout'
                        output_style = job.get("output_style", "simple")
                        if output_style == "layout":
                            from services.layout_templates import apply_catalog_layout
                            image_bytes = apply_catalog_layout(
                                image_bytes=image_bytes,
                                theme_id=theme_id,
                                product_name=f"Product {product_idx + 1}",
                                product_number=job.get("catalog_number", ""),
                                price=product_meta.get("price", ""),
                                keywords=keywords,
                                logo_bytes=logo_bytes,
                                brand_name=job.get("client_name", ""),
                                layout_type="minimal"  # Default to minimal layout
                            )
                        
                        page_path = output_dir / f"page_{page_num:03d}_p{product_idx + 1}_{page_type}.png"
                        page_path.write_bytes(image_bytes)
                        generated_images.append(str(page_path))
                        print(f"[{job_id}] ✓ Page {page_num} saved: {page_type}" + (" (with layout)" if output_style == "layout" else ""))

                    
                    job["completed_pages"] += 1
                    save_job(job_id, job)
                    
                except Exception as e:
                    import traceback
                    print(f"[{job_id}] ✗ Page {page_num} failed: {e}")
                    traceback.print_exc()
                    job["failed_pages"] += 1
                    save_job(job_id, job)
        
        # ==========================================
        # STEP 4: GENERATE PRICE LIST PAGE (if enabled)
        # ==========================================
        if job.get("include_price_list"):
            page_num += 1
            print(f"[{job_id}] Generating price list page...")
            try:
                from PIL import Image, ImageDraw, ImageFont
                from io import BytesIO
                
                pl_img = Image.new('RGB', (1600, 2000), color='#FFFFFF')
                draw = ImageDraw.Draw(pl_img)
                try:
                    title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 50)
                    item_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 30)
                except:
                    title_font = ImageFont.load_default()
                    item_font = ImageFont.load_default()
                
                draw.text((100, 80), "PRICE LIST", fill='#333333', font=title_font)
                
                y_pos = 180
                for i, product_meta in enumerate(job["products_metadata"]):
                    price = product_meta.get("price", "")
                    if price:
                        draw.text((100, y_pos), f"Product {i + 1}: ₹{price}", fill='#333333', font=item_font)
                        y_pos += 50
                
                buffer = BytesIO()
                pl_img.save(buffer, format="PNG")
                buffer.seek(0)
                
                pl_path = output_dir / f"page_{page_num:03d}_price_list.png"
                pl_path.write_bytes(buffer.getvalue())
                generated_images.append(str(pl_path))
                print(f"[{job_id}] ✓ Price list page saved")
                job["completed_pages"] += 1
                save_job(job_id, job)
            except Exception as e:
                print(f"[{job_id}] ✗ Price list page failed: {e}")
                job["failed_pages"] += 1
                save_job(job_id, job)
        
        # ==========================================
        # STEP 5: GENERATE THANK YOU PAGE (if enabled)
        # ==========================================
        if job.get("include_thank_you"):
            page_num += 1
            print(f"[{job_id}] Generating thank you page...")
            try:
                ty_image = await generator.generate_thank_you_page(
                    logo_bytes=logo_bytes,
                    theme_id=theme_id
                )
                ty_path = output_dir / f"page_{page_num:03d}_thank_you.png"
                ty_path.write_bytes(ty_image)
                generated_images.append(str(ty_path))
                print(f"[{job_id}] ✓ Thank you page saved")
                job["completed_pages"] += 1
                save_job(job_id, job)
            except Exception as e:
                print(f"[{job_id}] ✗ Thank you page failed: {e}")
                job["failed_pages"] += 1
                save_job(job_id, job)
        
        # ==========================================
        # STEP 6: CREATE PDF (if requested)
        # ==========================================
        output_format = job.get("output_format", "both")
        if output_format in ["pdf", "both"] and generated_images:
            print(f"[{job_id}] Compiling PDF...")
            try:
                from PIL import Image
                pdf_images = []
                for img_path in sorted(generated_images):
                    img = Image.open(img_path)
                    if img.mode == 'RGBA':
                        img = img.convert('RGB')
                    pdf_images.append(img)
                
                if pdf_images:
                    pdf_path = output_dir / f"{job['catalog_name'].replace(' ', '_')}.pdf"
                    pdf_images[0].save(
                        pdf_path,
                        save_all=True,
                        append_images=pdf_images[1:],
                        format="PDF",
                        resolution=150
                    )
                    print(f"[{job_id}] ✓ PDF compiled: {pdf_path}")
            except Exception as e:
                print(f"[{job_id}] ✗ PDF compilation failed: {e}")
        
        # ==========================================
        # STEP 7: MARK JOB COMPLETE
        # ==========================================
        job["status"] = "completed"
        job["completed_at"] = datetime.now().isoformat()
        job["generated_images"] = generated_images
        
        # Create download link
        base_url = os.getenv("PUBLIC_URL", "http://localhost:8000")
        job["download_link"] = f"{base_url}/api/pro/download/{job_id}"
        
        save_job(job_id, job)
        
        # Send email notification
        email_service.send_batch_complete_notification(
            job_id=job_id,
            catalog_name=job["catalog_name"],
            client_name=job["client_name"],
            download_link=job["download_link"],
            total_pages=job["total_pages"],
            failed_pages=job["failed_pages"]
        )
        
        print(f"[{job_id}] 🎉 Job completed! {job['completed_pages']} pages generated.")
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        
        job["status"] = "failed"
        job["error"] = str(e)
        save_job(job_id, job)
        
        # Send failure notification
        email_service.send_batch_failed_notification(
            job_id=job_id,
            catalog_name=job["catalog_name"],
            client_name=job["client_name"],
            error_message=str(e)
        )




@router.get("/jobs")
async def get_jobs(limit: int = 10):
    """Get list of recent jobs"""
    jobs = list_jobs(limit)
    return {"jobs": jobs}


@router.get("/jobs/{job_id}")
async def get_job_status(job_id: str):
    """Get status of a specific job"""
    job = load_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/download/{job_id}")
async def download_job_result(job_id: str):
    """Download completed job result"""
    job = load_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job["status"] != "completed":
        raise HTTPException(status_code=400, detail=f"Job is not completed. Status: {job['status']}")
    
    # For now, return the job directory as a zip
    job_dir = RESULTS_DIR / job_id / "output"
    
    if not job_dir.exists():
        raise HTTPException(status_code=404, detail="Output not found")
    
    # Create ZIP file
    import shutil
    zip_path = RESULTS_DIR / f"{job_id}_catalog.zip"
    
    if not zip_path.exists():
        shutil.make_archive(
            str(RESULTS_DIR / f"{job_id}_catalog"),
            'zip',
            job_dir
        )
    
    # Clean catalog name for filename
    safe_name = "".join(c if c.isalnum() or c in (' ', '-', '_') else '' for c in job['catalog_name'])
    safe_name = safe_name.replace(' ', '_') or 'catalog'
    download_filename = f"{safe_name}_catalog.zip"
    
    return FileResponse(
        path=zip_path,
        media_type='application/zip',
        filename=download_filename,
        headers={
            "Content-Disposition": f'attachment; filename="{download_filename}"'
        }
    )



@router.post("/generate-instant")
async def generate_instant(
    client_name: str = Form(...),
    catalog_name: str = Form(...),
    catalog_number: str = Form(""),
    category: str = Form(...),
    age_range: str = Form("[]"),
    theme: str = Form(...),
    setting: str = Form(...),
    language: str = Form("english"),
    include_index: bool = Form(False),
    include_price_list: bool = Form(False),
    include_thank_you: bool = Form(True),
    quality: str = Form("2K"),
    aspect_ratio: str = Form("a4_portrait"),
    output_format: str = Form("both"),
    generation_mode: str = Form("instant"),
    products_metadata: str = Form("[]"),
    front_images: List[UploadFile] = File(...),
    back_images: List[UploadFile] = File(...),
    logo: Optional[UploadFile] = File(None)
):
    """Generate catalog instantly (synchronous)"""
    # For now, redirect to batch and wait
    # In production, this would use the real-time API
    raise HTTPException(
        status_code=501, 
        detail="Instant generation not yet implemented. Please use batch mode."
    )
