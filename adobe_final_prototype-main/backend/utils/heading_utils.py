import fitz  # PyMuPDF
from collections import Counter, defaultdict
import re
from statistics import median

# ---------- All Helper Functions (from previous versions) ----------

#<editor-fold desc="Helper functions">
_PUNCT_END = re.compile(r"[.,:;!?]$")
_NUMERIC_ONLY = re.compile(r"^\s*[\d\.\-\(\)\/]+\s*$")
_PAGE_LABEL = re.compile(
    r"^\s*(page\s*\d+|\d+\s*/\s*\d+|\d+\s+of\s+\d+)\s*$",
    re.IGNORECASE,
)
_URL_OR_EMAIL = re.compile(r"(https?://|www\.|[\w\.-]+@[\w\.-]+)")
COMMON_NON_HEADINGS = {
    "name", "age", "s.no", "date", "relationship", "remarks",
    "goals", "days", "syllabus", "identifier", "reference"
}
def _clean(text: str) -> str:
    text = re.sub(r"\s+", " ", text or "")
    return "".join(ch for ch in text if ch.isprintable()).strip()
def _dominant_size_and_bold(block) -> tuple[float, bool]:
    sizes, bold_votes, spans = [], 0, []
    for line in block.get("lines", []):
        for s in line.get("spans", []):
            if not s.get("text", "").strip(): continue
            spans.append(s)
            sizes.append(round(float(s.get("size", 0)), 1))
            if "bold" in (s.get("font", "") or "").lower(): bold_votes += 1
    if not spans: return 0.0, False
    cnt = Counter(sizes)
    size = sorted(cnt.items(), key=lambda kv: (kv[1], kv[0]))[-1][0]
    return size, bold_votes >= (len(spans) / 2)
def _page_body_size(doc) -> float:
    counts = Counter()
    for page in doc:
        for block in page.get_text("dict").get("blocks", []):
            if block.get("type", 0) != 0: continue
            for line in block.get("lines", []):
                for s in line.get("spans", []):
                    txt = (s.get("text") or "").strip()
                    if not txt: continue
                    size = round(float(s.get("size", 0)), 1)
                    counts[size] += len(txt)
    if not counts: return 12.0
    return sorted(counts.items(), key=lambda kv: kv[1])[-1][0]
def _collect_repeated_headers_footers(doc, margin_pt=72):
    seen = defaultdict(int)
    total_pages = len(doc)
    if total_pages < 3: return set()
    for page in doc:
        h = page.rect.height
        page_texts = set()
        for b in page.get_text("dict").get("blocks", []):
            if b.get("type", 0) != 0 or not b.get("lines"): continue
            y0, y1 = b["bbox"][1], b["bbox"][3]
            if y0 <= margin_pt or y1 >= (h - margin_pt):
                txt = _clean(" ".join(s["text"] for l in b["lines"] for s in l["spans"]))
                if txt: page_texts.add(txt.lower())
        for t in page_texts: seen[t] += 1
    threshold = max(2, int(0.4 * total_pages))
    return {t for t, c in seen.items() if c >= threshold}
def _is_toc_page(page) -> bool:
    raw = page.get_text("text") or ""
    low = raw.lower()
    if "table of contents" not in low: return False
    dotted = len(re.findall(r"\.{3,}", raw))
    numeric_ends = len(re.findall(r"\d+\s*$", raw, flags=re.MULTILINE))
    return dotted >= 3 or numeric_ends >= 6
def _is_heading_candidate(text, size, is_bold, body_size, line_count, word_count):
    if not text or len(text) < 3 or word_count > 25 or line_count > 3: return False
    if text.lower() in COMMON_NON_HEADINGS: return False
    if _PUNCT_END.search(text) or _NUMERIC_ONLY.match(text) or _URL_OR_EMAIL.search(text): return False
    big_enough = size >= (body_size + 1.5)
    bold_ok = is_bold and size >= (body_size - 0.2)
    return big_enough or bold_ok
def _is_form_document(doc):
    if doc.page_count == 0: return False
    first_page = doc[0]
    text_content = first_page.get_text("text").lower()
    if not re.search(r"(application|form|registration|claim|survey)", text_content): return False
    blocks = first_page.get_text("dict")["blocks"]
    short_lines = total_lines = colon_lines = 0
    for b in blocks:
        if b.get("type", 0) != 0: continue
        for l in b.get("lines", []):
            text = _clean(" ".join(s["text"] for s in l["spans"]))
            if not text: continue
            total_lines += 1
            if len(text.split()) <= 8: short_lines += 1
            if text.strip().endswith(":"): colon_lines += 1
    if total_lines == 0: return False
    return (short_lines / total_lines) > 0.4 and colon_lines > 2
def _is_summary_sheet(doc):
    if doc.page_count != 1: return False
    page = doc[0]
    text_content = page.get_text("text")
    if len(re.findall(r"[●•*➢-]\s+", text_content)) >= 3: return True
    lines = [line.strip() for line in text_content.split('\n') if line.strip()]
    if not lines: return False
    short_lines = sum(1 for line in lines if len(line.split()) < 8)
    if len(lines) > 5 and (short_lines / len(lines)) > 0.5: return True
    return False
def _is_certificate_or_marksheet(doc):
    if doc.page_count > 2: return False
    text_content = doc[0].get_text("text").lower()
    keywords = ["certificate", "marks statement", "board of", "examination", "university of", "statement of marks"]
    if not any(kw in text_content for kw in keywords): return False
    has_table = False
    for block in doc[0].get_text("dict").get("blocks", []):
        if len(block.get("lines", [])) > 4:
            line_lengths = [len(l.get("spans", [])) for l in block.get("lines", [])]
            if len(line_lengths) > 3 and max(Counter(line_lengths).values()) > 2:
                has_table = True
                break
    return has_table
def _extract_title_from_first_page(doc):
    if doc.page_count == 0: return ""
    max_size = 0
    candidates = []
    page = doc[0]
    search_rect = fitz.Rect(0, 0, page.rect.width, page.rect.height / 2)
    blocks = page.get_text("dict", clip=search_rect).get("blocks", [])
    for b in blocks:
        if b.get("type", 0) != 0: continue
        for l in b.get("lines", []):
            for s in l.get("spans", []):
                text = s.get("text", "").strip()
                if not text or not re.search(r'[a-zA-Z]', text): continue
                size = s["size"]
                if size > max_size:
                    max_size = size
                    candidates = [text]
                elif abs(size - max_size) < 0.5:
                    candidates.append(text)
    return " ".join(candidates).strip()
#</editor-fold>

# ---------- API FUNCTION 1: For Original 'extract' Route ----------
# This function returns a FLAT LIST for your existing frontend feature.
def extract_headings_and_text(filepath: str, filename: str):
    """
    Extracts document structure and returns it as a flat list of dictionaries.
    This is for the original feature that shows the full parsed PDF.
    """
    try:
        doc = fitz.open(filepath)
    except Exception:
        return []

    if len(doc) == 0:
        return []

    # Handle special documents by returning only the title
    if _is_form_document(doc) or _is_summary_sheet(doc) or _is_certificate_or_marksheet(doc):
        title = _extract_title_from_first_page(doc)
        doc.close()
        if not title: return []
        return [{"page": 0, "type": "heading", "level": "H1", "content": title, "bbox": [0, 0, 0, 0]}]

    # --- Main Processing for Standard Documents ---
    body_size = _page_body_size(doc)
    repeated_margin_texts = _collect_repeated_headers_footers(doc)
    toc_pages = {i for i, p in enumerate(doc) if _is_toc_page(p)}
    
    structured_sections = []
    current_section = {"level": "P", "text": "Introduction", "page": 0, "content": "", "bbox": [0,0,0,0]}

    for page_idx, page in enumerate(doc):
        if page_idx in toc_pages: continue
        for block in page.get_text("dict").get("blocks", []):
            if block.get("type", 0) != 0 or not block.get("lines"): continue
            
            block_text = _clean(" ".join(s["text"] for l in block["lines"] for s in l["spans"]))
            if not block_text or block_text.lower() in repeated_margin_texts or _PAGE_LABEL.match(block_text):
                continue

            size, is_bold = _dominant_size_and_bold(block)
            word_count = len([w for w in re.split(r"\s+", block_text) if re.search(r"[A-Za-z]", w)])
            line_count = len(block.get("lines", []))
            bbox = list(block.get("bbox", [0, 0, 0, 0]))

            if _is_heading_candidate(block_text, size, is_bold, body_size, line_count, word_count):
                if current_section["content"].strip(): structured_sections.append(current_section)
                level = "H3"
                if size >= body_size + 4: level = "H1"
                elif size >= body_size + 2: level = "H2"
                current_section = {"level": level, "text": block_text, "page": page_idx, "content": "", "bbox": bbox}
            else:
                current_section["content"] += block_text + "\n"

    if current_section["content"].strip() or (not structured_sections and current_section['text'] != 'Introduction'):
        structured_sections.append(current_section)

    if structured_sections and structured_sections[0]["text"] == "Introduction" and not structured_sections[0]["content"].strip():
        structured_sections.pop(0)

    # Flatten the structured sections into the final list
    flat_list = []
    for section in structured_sections:
        if section["text"] != "Introduction":
            flat_list.append({"page": section["page"], "type": "heading", "level": section["level"], "content": section["text"], "bbox": section["bbox"]})
        if section["content"].strip():
            flat_list.append({"page": section["page"], "type": "text", "content": section["content"].strip(), "bbox": section["bbox"]})
            
    doc.close()
    return flat_list


# ---------- API FUNCTION 2: For New 'Contextual Search' Feature ----------
# This function returns a STRUCTURED LIST for the new search service.
def extract_structured_sections(filepath: str):
    """
    Extracts a structured list of sections (heading + content) from a PDF.
    This is the primary function for the new search/snippet feature.
    """
    try:
        doc = fitz.open(filepath)
    except Exception:
        return []

    if len(doc) == 0: return []

    if _is_form_document(doc) or _is_summary_sheet(doc) or _is_certificate_or_marksheet(doc):
        title = _extract_title_from_first_page(doc)
        full_text = " ".join(page.get_text("text") for page in doc)
        doc.close()
        if not title: return []
        return [{"heading": title, "level": "H1", "page": 0, "bbox": [0, 0, 0, 0], "content": _clean(full_text)}]

    body_size = _page_body_size(doc)
    repeated_margin_texts = _collect_repeated_headers_footers(doc)
    toc_pages = {i for i, p in enumerate(doc) if _is_toc_page(p)}
    
    sections = []
    current_section = {"heading": "Introduction", "level": "P", "page": 0, "content": "", "bbox": [0,0,0,0]}

    for page_idx, page in enumerate(doc):
        if page_idx in toc_pages: continue
        for block in page.get_text("dict").get("blocks", []):
            if block.get("type", 0) != 0 or not block.get("lines"): continue
            
            block_text = _clean(" ".join(s["text"] for l in block["lines"] for s in l["spans"]))
            if not block_text or block_text.lower() in repeated_margin_texts or _PAGE_LABEL.match(block_text):
                continue

            size, is_bold = _dominant_size_and_bold(block)
            word_count = len([w for w in re.split(r"\s+", block_text) if re.search(r"[A-Za-z]", w)])
            line_count = len(block.get("lines", []))
            bbox = list(block.get("bbox", [0, 0, 0, 0]))

            if _is_heading_candidate(block_text, size, is_bold, body_size, line_count, word_count):
                if current_section["content"].strip(): sections.append(current_section)
                level = "H3"
                if size >= body_size + 4: level = "H1"
                elif size >= body_size + 2: level = "H2"
                current_section = {"heading": block_text, "level": level, "page": page_idx, "content": "", "bbox": bbox}
            else:
                current_section["content"] += block_text + "\n"

    if current_section["content"].strip() or (not sections and current_section['heading'] != 'Introduction'):
        sections.append(current_section)

    if sections and sections[0]["heading"] == "Introduction" and not sections[0]["content"].strip():
        sections.pop(0)
            
    doc.close()
    return sections