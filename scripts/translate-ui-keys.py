#!/usr/bin/env python3
"""
Translate missing UI message keys for Fertilizer Dose into all non-English locales.

- Source: src/messages/en.json (missing keys per locale)
- Engine: Google Translate gtx endpoint (same as translate-posts.mjs)
- Merges into src/messages/{locale}.json, NEVER overwrites existing keys
- Resume-safe: skips keys already present
- QA: {placeholders} must survive translation; failures keep English + logged

Usage: python3 scripts/translate-ui-keys.py [--locales ur,hi] [--limit 50]
"""
import json, io, re, sys, time, urllib.request, urllib.parse

BASE = "/home/hatch/workspace/khaadguide/khaadguide-v2"
LOCALES = ["ur","hi","es","ru","fr","de","it","pt","bn","ja","ko","ms","pl","id","ar","bg","tr","sv"]
DELAY = 1.0  # seconds between requests (conservative after 2026-10-16 throttle)

def flat_keys(d, p=""):
    out = {}
    if isinstance(d, dict):
        items = d.items()
    elif isinstance(d, list):
        items = enumerate(d)
    else:
        return {p.rstrip("."): d} if p else {}
    for k, v in items:
        key = f"{p}{k}."
        if isinstance(v, (dict, list)):
            out.update(flat_keys(v, key))
        else:
            out[key.rstrip(".")] = v
    return out

def set_nested(d, dotted, value):
    parts = dotted.split(".")
    for i, p in enumerate(parts[:-1]):
        nxt = parts[i + 1]
        # decide container type by whether next part is numeric
        if p.isdigit():
            p = int(p)
            # d must be a list here
            while len(d) <= p:
                d.append({} if not nxt.isdigit() else [])
            d = d[p]
        else:
            if nxt.isdigit():
                d = d.setdefault(p, [])
            else:
                d = d.setdefault(p, {})
    last = parts[-1]
    if last.isdigit():
        last = int(last)
        while len(d) <= last:
            d.append(None)
        d[last] = value
    else:
        d[last] = value

def gt_translate(text, tl):
    url = ("https://translate.googleapis.com/translate_a/single"
           f"?client=gtx&sl=en&tl={tl}&dt=t&q={urllib.parse.quote(text)}")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = json.loads(r.read().decode("utf-8"))
    # data[0] = list of [translated, original, ...] segments
    return "".join(seg[0] for seg in data[0] if seg[0])

def placeholders(s):
    return set(re.findall(r"\{[a-zA-Z0-9_]+\}", s))

def main():
    locales = LOCALES
    limit = None
    for a in sys.argv[1:]:
        if a.startswith("--locales="):
            locales = a.split("=",1)[1].split(",")
        elif a.startswith("--limit="):
            limit = int(a.split("=",1)[1])

    en = json.load(io.open(f"{BASE}/src/messages/en.json", encoding="utf-8"))
    en_flat = flat_keys(en)
    log = []

    for loc in locales:
        path = f"{BASE}/src/messages/{loc}.json"
        try:
            cur = json.load(io.open(path, encoding="utf-8"))
        except FileNotFoundError:
            cur = {}
        cur_flat = flat_keys(cur)
        missing = [(k, v) for k, v in en_flat.items()
                   if k not in cur_flat and isinstance(v, str) and v.strip()]
        if limit:
            missing = missing[:limit]
        print(f"[{loc}] {len(missing)} keys to translate", flush=True)
        done = 0
        for key, src in missing:
            ph = placeholders(src)
            try:
                tr = gt_translate(src, loc)
                time.sleep(DELAY)
                # QA: placeholders must survive
                if ph and ph - placeholders(tr):
                    # one retry
                    time.sleep(DELAY)
                    tr2 = gt_translate(src, loc)
                    time.sleep(DELAY)
                    if ph - placeholders(tr2):
                        log.append({"locale": loc, "key": key,
                                    "issue": "placeholder-lost", "src": src})
                        continue  # keep English (don't write broken string)
                    tr = tr2
                set_nested(cur, key, tr)
                done += 1
            except Exception as e:
                log.append({"locale": loc, "key": key,
                            "issue": f"translate-error: {e}", "src": src})
                time.sleep(2)
            if done % 50 == 0:
                # periodic save (resume-safe)
                with io.open(path, "w", encoding="utf-8") as f:
                    json.dump(cur, f, ensure_ascii=False, indent=2)
                    f.write("\n")
        with io.open(path, "w", encoding="utf-8") as f:
            json.dump(cur, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"[{loc}] done: {done} translated, {len(log)} issues total", flush=True)

    if log:
        with io.open(f"{BASE}/scripts/ui-translation-issues.json", "w", encoding="utf-8") as f:
            json.dump(log, f, ensure_ascii=False, indent=2)
        print(f"Logged {len(log)} issues to scripts/ui-translation-issues.json")

if __name__ == "__main__":
    main()
