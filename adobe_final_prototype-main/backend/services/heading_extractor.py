# services/headings_extractor.py
import fitz  # PyMuPDF
import re
from collections import Counter

# --- HELPER FUNCTIONS ---

def clean_text(text: str) -> str:
    """Removes extra whitespace, non-printable characters, and leading list markers."""
    text = re.sub(r'\s+', ' ', text)
    # Aggressively strip list markers and form numbering
    text = re.sub(r'^\s*([\•\-\*▪▫]|\d[\d\.]*|[a-zA-Z][\.\)])\s*', '', text)
    return ''.join(char for char in text if char.isprintable()).strip()

def is_block_a_heading(block_text: str, block_style: tuple, body_style: tuple) -> bool:
    """
    Determines if a text block is a heading. This is now stricter, focusing on style
    and rejecting anything that looks like a form field.
    """
    # Rule 1: Must have a more prominent style than body text.
    is_distinct_style = block_style[0] > body_style[0] or (block_style[0] == body_style[0] and block_style[1] and not body_style[1])
    if not is_distinct_style:
        return False

    # Rule 2: Must be very short.
    word_count = len(block_text.split())
    if word_count > 10:
        return False

    # Rule 3: Must not end with sentence-like punctuation.
    if block_text.endswith(('.', ':', ',', ';')):
        return False
        
    # Rule 4: Reject if it looks like a form field label (e.g., starts with a number).
    if re.match(r'^\d+', block_text):
        return False

    # Rule 5: Reject common non-heading phrases.
    non_headings = {
        'mission statement', 'goals', 'table of contents', 'revision history', 'acknowledgements',
        'contents', 'introduction', 'summary', 'conclusion', 'references', 'appendix',
        'name', 'age', 's.no', 'date', 'relationship', 'remarks', 'designation'
    }
    if block_text.lower() in non_headings:
        return False
        
    return True

def extract_title(doc: fitz.Document) -> str:
    """Extracts the main title, focusing on the largest text at the top of the first page."""
    if doc.page_count == 0:
        return ""

    page_one = doc[0]
    # Search only the top 30% of the page
    search_rect = page_one.rect
    search_rect.y1 = page_one.rect.height * 0.3
    
    blocks = page_one.get_text("dict", clip=search_rect)["blocks"]
    
    max_font_size = 0
    # First pass: find the maximum font size in the title area
    for b in blocks:
        if b['type'] == 0:
            for l in b['lines']:
                for s in l['spans']:
                    if len(s['text'].strip()) > 2:
                        max_font_size = max(max_font_size, s['size'])

    if max_font_size < 12: # Titles must have a reasonably large font
        return ""

    # Second pass: collect all text with that font size
    title_candidates = []
    for b in blocks:
        if b['type'] == 0:
            for l in b['lines']:
                if all(abs(s['size'] - max_font_size) < 1.0 for s in l['spans']):
                    line_text = "".join(s['text'] for s in l['spans'])
                    cleaned_line = clean_text(line_text)
                    if cleaned_line:
                        title_candidates.append(cleaned_line)

    return " ".join(title_candidates)


# --- MAIN FUNCTION ---

def parse_pdf_to_outline(pdf_path: str) -> dict:
    """
    Parses a PDF to extract its title and a structured outline of headings,
    with special logic to handle and filter out form-like content.
    """
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        return {"title": "", "outline": [f"Error opening PDF: {e}"]}

    if doc.page_count == 0:
        return {"title": "", "outline": []}

    final_outline = []
    
    # For single-page documents that are forms, we only want the title.
    # Heuristic: A document is a form if it has many small text blocks.
    if doc.page_count == 1:
        blocks = doc[0].get_text("blocks")
        # If there are more than 15 text blocks, it's likely a form.
        if len(blocks) > 15:
            title = extract_title(doc)
            # For forms, we return the title and an empty outline.
            return {"title": title, "outline": []}

    # --- Logic for multi-page or non-form documents ---

    # 1. Analyze styles to find the most common "body" text style
    style_counts = Counter()
    for page in doc:
        dict_blocks = page.get_text("dict")["blocks"]
        for b in dict_blocks:
            if b.get('lines'):
                for l in b['lines']:
                    for s in l['spans']:
                        style = (round(s['size']), 'bold' in s['font'].lower())
                        # Consider only common text sizes for body style calculation
                        if 8 < style[0] < 14:
                            style_counts[style] += 1
    
    body_style = style_counts.most_common(1)[0][0] if style_counts else (10, False)

    # 2. Identify all potential headings
    heading_blocks = []
    for page_num, page in enumerate(doc):
        dict_blocks = page.get_text("dict")["blocks"]
        for b in dict_blocks:
            if b.get('lines'):
                block_text = clean_text(" ".join(s['text'] for l in b['lines'] for s in l['spans']))
                if not block_text: continue
                
                span_styles = [(round(s['size']), 'bold' in s['font'].lower()) for l in b['lines'] for s in l['spans']]
                if not span_styles: continue
                
                dominant_style = Counter(span_styles).most_common(1)[0][0]

                if is_block_a_heading(block_text, dominant_style, body_style):
                    heading_blocks.append({
                        "text": block_text,
                        "style": dominant_style,
                        "page": page_num
                    })

    # 3. Assign H1, H2, etc. levels
    heading_styles = sorted(list({b['style'] for b in heading_blocks}), key=lambda x: x[0], reverse=True)
    level_map = {style: f"H{i+1}" for i, style in enumerate(heading_styles)}

    # 4. Build the final outline
    processed_texts = set()
    for block in heading_blocks:
        text = block['text']
        if (text, block['page']) not in processed_texts:
            final_outline.append({
                "level": level_map.get(block['style'], 'H9'),
                "text": text,
                "page": block['page']
            })
            processed_texts.add((text, block['page']))

    # 5. Final cleanup
    title = extract_title(doc)
    if title:
        final_outline = [item for item in final_outline if item['text'] != title]

    final_outline.sort(key=lambda x: x['page'])

    doc.close()
    
    return {
        "title": title,
        "outline": final_outline
    }
