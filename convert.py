import json
import re

def parse_bounty(raw):
    raw = raw.strip()
    # currency marker to ฿
    m = re.match(r'^[฿B]\s*([\d.]+)\s*([KMB]?)$', raw)
    if not m:
        raise ValueError(f"Could not parse bounty: {raw!r}")
    number, suffix = m.groups()
    value = float(number)
    multiplier = {'': 1, 'K': 1_000, 'M': 1_000_000, 'B': 1_000_000_000}[suffix]
    numeric = value * multiplier
    display = f"฿{number}{suffix}" if numeric != 0 else "฿0"
    return display, numeric

def parse_height(raw):
    raw = raw.strip()
    if raw.endswith('cm'):
        return float(raw[:-2])
    m = re.match(r'^(\d+)m(\d*)$', raw)
    if not m:
        raise ValueError(f"Could not parse height: {raw!r}")
    meters, cm_part = m.groups()
    meters = int(meters)
    cm = int(cm_part) if cm_part else 0
    return meters * 100 + cm

def parse_haki(raw):
    raw = raw.strip()
    if raw == 'None':
        return []
    return [h.strip() for h in raw.split('+')]

SAGA_ORDER = []
characters = []
current_saga = None
current_arc = None
order_index = 0

with open('source.txt', encoding='utf-8') as f:
    lines = [l.rstrip('\n') for l in f]

for line in lines:
    stripped = line.strip()
    if not stripped:
        continue
    if stripped.startswith('--'):
        arc_name = stripped.strip('- ').strip()
        arc_name = re.sub(r'\s*Arc$', '', arc_name).strip()
        current_arc = arc_name
        continue
    if '|' not in stripped:
        current_saga = stripped
        SAGA_ORDER.append(current_saga)
        continue

    parts = [p.strip() for p in stripped.split('|')]
    if len(parts) < 9:
        raise ValueError(f"Line does not have enough fields: {stripped!r}")

    name, gender, affiliation, df_type, haki_raw, bounty_raw, height_raw, origin, arc_field = parts[:9]
    dfn_raw = parts[9] if len(parts) > 9 else None

    bounty_display, bounty_value = parse_bounty(bounty_raw)
    height_cm = parse_height(height_raw)
    haki_list = parse_haki(haki_raw)
    devil_fruit_name = dfn_raw if dfn_raw else "∅"

    characters.append({
        "name": name,
        "gender": gender,
        "affiliation": affiliation,
        "devilFruitType": df_type,
        "haki": haki_list,
        "hakiRaw": haki_raw,
        "bounty": bounty_display,
        "bountyValue": bounty_value,
        "height": height_raw,
        "heightCm": height_cm,
        "origin": origin,
        "arc": arc_field,
        "saga": current_saga,
        "devilFruitName": devil_fruit_name,
        "orderIndex": order_index,
    })
    order_index += 1

print(f"Parsed {len(characters)} characters across {len(SAGA_ORDER)} sagas.")

with open('characters.json', 'w', encoding='utf-8') as f:
    json.dump(characters, f, ensure_ascii=False, indent=2)
    
with open('saga_order.json', 'w', encoding='utf-8') as f:
    json.dump(SAGA_ORDER, f, ensure_ascii=False, indent=2)

print("Wrote characters.json and saga_order.json")
