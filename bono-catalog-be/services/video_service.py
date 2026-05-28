import os
import asyncio
import time
from typing import Optional, List
from io import BytesIO
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

class VideoService:
    """Service for generating videos using Veo 3.1"""
    
    # Model versions
    STANDARD_MODEL = "veo-3.1-generate-preview"
    FAST_MODEL = "veo-3.1-fast-generate-preview"
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment")
        
        self.client = genai.Client(api_key=self.api_key, http_options={'api_version': 'v1alpha'})

    async def generate_fashion_clip(
        self,
        image_bytes: bytes,
        prompt: str,
        model_type: str = "fast",
        aspect_ratio: str = "3:4",
        duration_seconds: int = 5,
        negative_prompt: str = "low quality, blurry, distorted, deformed, cartoon, drawing"
    ) -> Optional[bytes]:
        """
        Generate a catchy fashion clip from an image using Veo 3.1.
        
        Args:
            image_bytes: The source image (e.g., generated catalog photo)
            prompt: Creative direction for the video
            model_type: "fast" or "standard"
            aspect_ratio: Video aspect ratio
            duration_seconds: Duration in seconds (usually 5, 6, 8)
            
        Returns:
            Video bytes (MP4) or None if failed
        """
        model = self.FAST_MODEL if model_type == "fast" else self.STANDARD_MODEL
        
        print(f"🎬 Starting video generation using {model}...")
        print(f"   Prompt: {prompt}")
        print(f"   Duration: {duration_seconds}s")
        
        try:
            # Step 1: Initialize the video generation operation
            # Veo 3.1 supports image-to-video using the 'image' parameter
            operation = self.client.models.generate_videos(
                model=model,
                prompt=prompt,
                config=types.GenerateVideosConfig(
                    aspect_ratio=aspect_ratio,
                    duration_seconds=duration_seconds,
                    negative_prompt=negative_prompt,
                    # We can pass the initial frame as a reference image
                    reference_images=[
                        types.VideoGenerationReferenceImage(
                            image=types.Part.from_bytes(data=image_bytes, mime_type="image/png"),
                            reference_type="first_frame"
                        )
                    ]
                )
            )
            
            # Step 2: Poll for completion (Veo is asynchronous)
            # We'll use a maximum of 3 minutes timeout
            start_time = time.time()
            max_wait = 180 
            
            while not operation.done:
                if time.time() - start_time > max_wait:
                    print("⚠️ Video generation timed out after 3 minutes")
                    return None
                
                print(f"⏳ Waiting for video... (Elapsed: {int(time.time() - start_time)}s)")
                await asyncio.sleep(10)
                operation = self.client.operations.get(operation)
                
            if operation.error:
                print(f"❌ Video generation error: {operation.error}")
                return None
            
            # Step 3: Download the generated video
            generated_video = operation.response.generated_videos[0]
            print(f"✅ Video ready! File ID: {generated_video.video.name}")
            
            # Use chunks to read video bytes
            video_buffer = BytesIO()
            # client.files.download returns a generator or bytes depending on usage
            # In v1alpha, we can download the file content
            file_data = self.client.files.download(file=generated_video.video)
            video_buffer.write(file_data)
            
            return video_buffer.getvalue()
            
        except Exception as e:
            print(f"💥 Failed to generate video: {str(e)}")
            import traceback
            traceback.print_exc()
            return None

    def get_catchy_prompt(self, product_desc: str, effect: str = "snap") -> str:
        """Helper to generate innovative prompts"""
        if effect == "snap":
            return (
                f"Cinematic fashion clip. The model looks directly at the camera with a confident smile, "
                f"snaps their fingers, and in a magical burst of shimmer, their outfit instantly transforms "
                f"into {product_desc}. The lighting shifts from warm sun to vibrant studio cool. "
                f"High-end fashion commercial style."
            )
        elif effect == "walk":
            return (
                f"Dynamic low-angle tracking shot. The model walks confidently towards the camera, "
                f"hand-in-pocket, showcasing the movement and texture of {product_desc}. "
                f"The environment is a blurred urban street at golden hour. "
                f"4k, cinematic motion blur."
            )
        elif effect == "macro":
            return (
                f"Extreme macro cinematic reveal. The camera starts deep within the fabric threads of "
                f"{product_desc}, showing incredible texture detail, then pulls back rapidly in a smooth "
                f"motion to reveal the full model spinning once and stopping with a pose. "
                f"High fashion editorial energy."
            )
        return f"A cinematic fashion clip of a model wearing {product_desc} in motion."
