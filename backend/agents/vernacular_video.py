import time
import os
from typing import Dict, Any, List
from llm.router import llm
from gtts import gTTS
from PIL import Image, ImageDraw, ImageFont
import json

class VernacularVideoAgent:
    def create_video(self, article: Dict[str, Any], session_id: str) -> tuple[Dict[str, Any], List[Dict[str, Any]]]:
        trace_steps = []
        video_data = {
            "hinglish_script": "",
            "hindi_script": "",
            "audio_path": "",
            "video_path": "",
            "status": "pending"
        }
        
        start_total = time.time()
        
        script_en, step1 = self._simplify_to_hinglish(article)
        trace_steps.append(step1)
        video_data['hinglish_script'] = script_en
        
        script_hi, step2 = self._translate_to_hindi(script_en)
        trace_steps.append(step2)
        video_data['hindi_script'] = script_hi
        
        audio_path, step3 = self._generate_audio(script_hi, session_id)
        trace_steps.append(step3)
        video_data['audio_path'] = audio_path
        
        subtitles, step4 = self._generate_subtitles(script_hi, audio_path)
        trace_steps.append(step4)
        
        video_path, step5 = self._assemble_video(article['headline'], script_hi, subtitles, audio_path, session_id)
        trace_steps.append(step5)
        video_data['video_path'] = video_path
        
        total_time = int((time.time() - start_total) * 1000)
        status = "PASS" if total_time < 60000 else "FAIL"
        
        trace_steps.append({
            "step": "Video Generation Complete",
            "agent": "VernacularVideoAgent",
            "status": status,
            "time_ms": total_time,
            "metadata": {"total_time_seconds": total_time / 1000}
        })
        
        video_data['status'] = status
        
        return video_data, trace_steps
    
    def _simplify_to_hinglish(self, article: Dict[str, Any]) -> tuple[str, Dict[str, Any]]:
        start_time = time.time()
        
        prompt = f"""Simplify this business news article into Hinglish (Hindi-English mix) for common people. Maximum 120 words. Replace ALL jargon with simple analogies.

Article: {article['headline']}
{article['body'][:800]}

Rules:
- Use simple words
- Include relatable analogy (like vegetable prices for inflation)
- Explain impact on common person
- Mix Hindi and English naturally
- Maximum 120 words

Write the simplified explanation:"""

        try:
            script = llm.call("creative", prompt, temperature=0.5, max_tokens=300)
            script = script.strip()
        except Exception as e:
            print(f"Hinglish simplification failed: {e}")
            script = f"Yeh news {article['headline']} ke baare mein hai. Iska asar aam logon par pad sakta hai."
        
        time_ms = int((time.time() - start_time) * 1000)
        
        return script, {
            "step": "Simplify to Hinglish",
            "agent": "VernacularVideoAgent",
            "status": "completed",
            "time_ms": time_ms,
            "metadata": {"word_count": len(script.split())}
        }
    
    def _translate_to_hindi(self, script_en: str) -> tuple[str, Dict[str, Any]]:
        start_time = time.time()
        
        prompt = f"""Translate this Hinglish text to spoken Hindi in Devanagari script. Keep it natural and conversational.

Hinglish text:
{script_en}

Provide ONLY the Hindi translation in Devanagari:"""

        try:
            script_hi = llm.call("translation", prompt, temperature=0.3, max_tokens=400)
            script_hi = script_hi.strip()
        except Exception as e:
            print(f"Hindi translation failed: {e}")
            script_hi = "यह एक महत्वपूर्ण खबर है जो आम लोगों को प्रभावित कर सकती है।"
        
        time_ms = int((time.time() - start_time) * 1000)
        
        return script_hi, {
            "step": "Translate to Hindi",
            "agent": "VernacularVideoAgent",
            "status": "completed",
            "time_ms": time_ms,
            "metadata": {"character_count": len(script_hi)}
        }
    
    def _generate_audio(self, script_hi: str, session_id: str) -> tuple[str, Dict[str, Any]]:
        start_time = time.time()
        
        os.makedirs("backend/videos", exist_ok=True)
        audio_path = f"backend/videos/{session_id}_audio.mp3"
        
        try:
            tts = gTTS(text=script_hi, lang='hi', slow=False)
            tts.save(audio_path)
        except Exception as e:
            print(f"TTS generation failed: {e}")
            audio_path = ""
        
        time_ms = int((time.time() - start_time) * 1000)
        
        return audio_path, {
            "step": "Generate TTS Audio",
            "agent": "VernacularVideoAgent",
            "status": "completed" if audio_path else "failed",
            "time_ms": time_ms,
            "metadata": {"audio_path": audio_path}
        }
    
    def _generate_subtitles(self, script_hi: str, audio_path: str) -> tuple[List[Dict[str, Any]], Dict[str, Any]]:
        start_time = time.time()
        
        sentences = [s.strip() for s in script_hi.split('।') if s.strip()]
        if not sentences:
            sentences = [script_hi]
        
        try:
            from pydub import AudioSegment
            audio = AudioSegment.from_mp3(audio_path)
            duration_seconds = len(audio) / 1000.0
        except:
            duration_seconds = len(sentences) * 3
        
        time_per_sentence = duration_seconds / len(sentences)
        
        subtitles = []
        current_time = 0
        for sentence in sentences:
            subtitles.append({
                "text": sentence,
                "start": current_time,
                "end": current_time + time_per_sentence
            })
            current_time += time_per_sentence
        
        time_ms = int((time.time() - start_time) * 1000)
        
        return subtitles, {
            "step": "Generate Subtitles",
            "agent": "VernacularVideoAgent",
            "status": "completed",
            "time_ms": time_ms,
            "metadata": {"subtitle_count": len(subtitles)}
        }
    
    def _get_fonts(self):
        en_paths = [
            "C:/Windows/Fonts/arial.ttf",
            "C:/Windows/Fonts/calibri.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "arial.ttf",
        ]
        hi_paths = [
            "C:/Windows/Fonts/mangal.ttf",
            "C:/Windows/Fonts/aparaj.ttf",
            "/usr/share/fonts/truetype/noto/NotoSansDevanagari-Regular.ttf",
        ]
        font_lg, font_md = None, None
        for p in en_paths:
            try:
                font_lg = ImageFont.truetype(p, 44)
                font_md = ImageFont.truetype(p, 28)
                break
            except:
                pass
        if not font_lg:
            font_lg = ImageFont.load_default()
            font_md = ImageFont.load_default()

        font_hi = None
        for p in hi_paths:
            try:
                font_hi = ImageFont.truetype(p, 32)
                break
            except:
                pass
        if not font_hi:
            font_hi = font_md
        return font_lg, font_md, font_hi

    def _make_frame(self, headline: str, subtitle: str, font_lg, font_md, font_hi) -> Image.Image:
        img = Image.new('RGB', (1280, 720), color='#001432')
        draw = ImageDraw.Draw(img)
        draw.rectangle([(50, 45), (320, 100)], fill='#dc143c')
        draw.text((185, 72), "BREAKING NEWS", fill='white', anchor="mm", font=font_md)
        draw.text((1230, 72), "NewsAgent AI", fill='#8899aa', anchor="rm", font=font_md)
        draw.rectangle([(50, 115), (1230, 118)], fill='#dc143c')
        lines = self._wrap_text(headline, 52).split('\n')
        y = 230
        for line in lines:
            draw.text((640, y), line, fill='white', anchor="mm", font=font_lg)
            y += 58
        if subtitle:
            draw.rectangle([(40, 598), (1240, 698)], fill='#000000')
            try:
                draw.text((640, 648), subtitle[:80], fill='#ffe066', anchor="mm", font=font_hi)
            except Exception:
                draw.text((640, 648), subtitle[:80], fill='#ffe066', anchor="mm", font=font_md)
        return img

    def _assemble_video(self, headline: str, script_hi: str, subtitles: List[Dict], audio_path: str, session_id: str) -> tuple[str, Dict[str, Any]]:
        start_time = time.time()
        video_path = f"backend/videos/{session_id}_video.mp4"
        temp_files = []

        try:
            from moviepy.editor import AudioFileClip, ImageClip, concatenate_videoclips

            if not os.path.exists(audio_path):
                raise Exception("Audio file not found")

            audio = AudioFileClip(audio_path)
            duration = audio.duration

            if not subtitles:
                subtitles = [{"text": script_hi[:80], "start": 0, "end": duration}]

            font_lg, font_md, font_hi = self._get_fonts()
            clips = []

            for idx, sub in enumerate(subtitles):
                img = self._make_frame(headline, sub['text'], font_lg, font_md, font_hi)
                frame_path = f"backend/videos/{session_id}_f{idx}.png"
                img.save(frame_path)
                temp_files.append(frame_path)
                clip_dur = max(0.5, sub['end'] - sub['start'])
                clips.append(ImageClip(frame_path).set_duration(clip_dur))

            final = concatenate_videoclips(clips, method="compose")
            if final.duration > duration:
                final = final.subclip(0, duration)
            final = final.set_audio(audio)
            final.write_videofile(
                video_path, fps=24, codec='libx264', audio_codec='aac',
                verbose=False, logger=None
            )
            final.close()
            audio.close()

        except Exception as e:
            print(f"Video assembly failed: {e}")
            import traceback; traceback.print_exc()
            video_path = ""
        finally:
            for f in temp_files:
                try:
                    os.remove(f)
                except:
                    pass

        time_ms = int((time.time() - start_time) * 1000)
        return video_path, {
            "step": "Assemble MP4 Video",
            "agent": "VernacularVideoAgent",
            "status": "completed" if video_path else "failed",
            "time_ms": time_ms,
            "metadata": {"video_path": video_path}
        }
    
    def _wrap_text(self, text: str, max_length: int) -> str:
        words = text.split()
        lines = []
        current_line = []
        
        for word in words:
            if len(' '.join(current_line + [word])) <= max_length:
                current_line.append(word)
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                current_line = [word]
        
        if current_line:
            lines.append(' '.join(current_line))
        
        return '\n'.join(lines[:3])
