#!/usr/bin/env python3
"""Parse Ahmed's 2026-10-15 NPK data (part 4: US, BD/IN, PK) into JSON records."""
import json

R = []

def rec(country, crop, region, n_min, n_max, p_min, p_max, k_min, k_max,
        application=None, source=None, note=None):
    r = {
        "country": country, "crop": crop, "region": region,
        "n_min": n_min, "n_max": n_max,
        "p2o5_min": p_min, "p2o5_max": p_max,
        "k2o_min": k_min, "k2o_max": k_max,
        "application": application, "source": source,
    }
    if note: r["_note"] = note
    R.append(r)

# ============ 10. UNITED STATES (US) ============
CB = "Purdue ID-56 / Midwest Land-Grant Extensions"
SE = "University of Florida IFAS / UGA Extension"
rec("US","tomato","Southern Plains",135,180,90,135,90,150,None,"Texas A&M AgriLife Extension")
rec("US","brinjal","Corn Belt",135,180,80,120,110,180,None,CB)
rec("US","chili","Corn Belt",120,160,70,110,110,160,None,CB)
rec("US","peas","Corn Belt",25,45,55,80,55,80,None,CB)
rec("US","cauliflower","Corn Belt",160,210,90,135,130,190,None,CB)
rec("US","cabbage","Corn Belt",140,190,80,120,110,170,None,CB)
rec("US","radish","Corn Belt",45,70,40,60,45,70,None,CB)
rec("US","carrot","Corn Belt",90,135,60,110,130,180,None,CB)
rec("US","spinach","Corn Belt",90,135,60,90,90,135,None,CB)
rec("US","okra","Corn Belt",90,110,60,90,90,130,None,CB)
rec("US","potato","Corn Belt",170,225,110,170,170,250,None,CB)
rec("US","garlic","Corn Belt",110,150,70,100,90,135,None,CB)
rec("US","onion","Corn Belt",110,150,80,110,110,150,None,CB)
rec("US","tomato","Corn Belt",135,190,90,135,170,240,None,CB)
rec("US","cabbage-chinese","Southeast",140,180,80,110,110,150,None,SE)
rec("US","cowpea","Southeast",30,45,45,65,45,65,None,SE,
    note="Ahmed: 'Peas (Cowpea)' -> mapped to cowpea")
rec("US","radish","Southeast",50,75,45,65,45,65,None,SE)
rec("US","cabbage","Southeast",160,210,80,110,110,160,None,SE)
rec("US","brinjal","Southeast",170,220,90,120,130,180,None,SE)
rec("US","chili","Southeast",170,220,90,120,130,180,None,SE)
rec("US","cauliflower","Southeast",170,220,90,120,130,180,None,SE)
rec("US","carrot","Southeast",120,160,80,110,140,200,None,SE)
rec("US","spinach","Southeast",90,130,60,90,80,120,None,SE)
rec("US","okra","Southeast",110,140,80,110,90,130,None,SE)
rec("US","potato","Southeast",170,225,90,150,150,220,None,SE)
rec("US","onion","Southeast",140,180,80,120,110,160,None,SE)
rec("US","tomato","Southeast",190,240,100,140,170,240,None,SE)
rec("US","sorghum","Georgia",80,120,40,60,60,90,None,"UGA AESL #006")
rec("US","cotton","Texas",80,135,45,70,45,90,None,"Texas A&M AgriLife")
rec("US","wheat","Great Plains",90,135,40,65,35,55,None,"K-State Research and Extension",
    note="Ahmed: 'Great Plains (KS/NE)'")
rec("US","soybean",None,0,0,45,75,65,110,None,"Mississippi State / Iowa State",
    note="Ahmed: 'SE & Corn Belt' -> treated as national (null)")
rec("US","potato","Pacific Northwest",220,270,120,180,220,320,
    "SOP basis.","University of Idaho Extension",
    note="Ahmed: 'Pacific Northwest (ID/WA/OR)'")

# ============ 11. BANGLADESH (BD) & INDIA (IN) ============
BD_AUTH = "BARI / BARC Fertilizer Recommendation Guide"
rec("BD","brinjal",None,140,175,60,80,120,160,None,BD_AUTH)
rec("BD","okra",None,60,80,40,55,70,100,None,BD_AUTH)
rec("BD","peas",None,15,25,35,45,25,35,None,BD_AUTH)
rec("BD","onion",None,100,130,80,110,80,110,None,BD_AUTH)
rec("BD","tomato",None,90,120,60,80,70,100,None,BD_AUTH)
rec("BD","potato",None,120,150,60,80,120,160,None,BD_AUTH)
rec("BD","mustard",None,60,85,30,45,35,50,None,BD_AUTH)
rec("BD","lentil",None,15,25,35,50,25,35,None,BD_AUTH)
rec("BD","sugarcane",None,120,150,60,85,80,110,None,BD_AUTH)
rec("BD","jute",None,50,70,20,30,35,50,None,BD_AUTH)
rec("BD","maize",None,200,260,80,120,120,170,None,BD_AUTH)
rec("BD","wheat",None,90,120,50,70,40,60,None,BD_AUTH)
rec("BD","rice",None,120,150,45,60,60,90,None,BD_AUTH,
    note="Ahmed: 'Rice (Boro)'")
rec("IN","brinjal",None,120,150,60,80,60,80,None,"ICAR-IIVR Varanasi",
    note="Ahmed: 'Brinjal | India National'")
rec("IN","cauliflower","Tamil Nadu",100,130,80,100,50,75,None,"TNAU CPG")
rec("IN","cabbage","Tamil Nadu",100,130,100,125,40,60,None,"TNAU CPG")
rec("IN","onion","Tamil Nadu",80,110,100,140,60,85,None,"TNAU CPG")
rec("IN","okra","Tamil Nadu",60,80,40,60,30,45,None,"TNAU CPG")
rec("IN","chili","Tamil Nadu",100,125,60,80,60,80,None,"TNAU CPG")
rec("IN","chili","Punjab",100,135,45,60,40,60,None,"PAU Ludhiana")

# ============ 12. PAKISTAN (PK) ============
rec("PK","olive","Punjab",80,120,45,65,90,135,
    "P, K, and 1/3 N in January/February; balance N split at flowering and pit hardening. Bearing tree basis: 400-600g N, 250-350g P2O5, 500-700g K2O per tree at 250 trees/ha.",
    "BARI Chakwal / PODB / SMEDA",
    note="Ahmed: 'Punjab (Pothwar / Chakwal)'")
rec("PK","grape","KPK",90,130,50,75,110,160,
    "Full P, 50% K, 1/3 N at late winter bud break; balance N/K post-fruit set and veraison.",
    "ARI Tarnab Peshawar / Horticultural Research Institute AARI",
    note="Ahmed: 'KPK (Peshawar / Swat)'")
rec("PK","sunflower","Punjab",75,90,50,65,0,30,
    "Full P/K + 1/2 N basal; 1/2 N at flowering/head formation (pehle paani par).",
    "Oilseeds Research Institute, AARI Faisalabad / PMAS-AAUR")
rec("PK","canola","Punjab",80,100,50,65,30,45,
    "Full P/K/S + 1/2 N basal; 1/2 N at 1st irrigation before flowering. + 15 kg S.",
    "Oilseeds Research Institute, AARI Faisalabad / PARC",
    note="Ahmed: 'Canola (Rapeseed)'")
rec("PK","mustard","Punjab",75,90,45,60,25,35,
    "Full P/K + 1/2 N at sowing; 1/2 N at 1st irrigation.",
    "Directorate of Agriculture Extension Punjab / AARI",
    note="Ahmed: 'Mustard (Raya)'")

if __name__ == "__main__":
    with open("import_part4.json", "w", encoding="utf-8") as f:
        json.dump(R, f, ensure_ascii=False, indent=1)
    print(f"Part 4: {len(R)} records")
