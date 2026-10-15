#!/usr/bin/env python3
"""Parse Ahmed's 2026-10-15 NPK data (part 1: TR, PL, ES) into JSON records."""
import json

R = []  # records

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

# ============ 1. TURKIYE (TR) ============
rec("TR","potato","Thrace",160,200,80,110,180,240,
    "50% N, 100% P, 50% K at planting; 50% N and 50% K at earthing-up (bogaz doldurma, 30 DAP). SOP preferred.",
    "T.C. Tarim ve Orman Bakanligi / TAGEM Trakya Tarimsal Arastirma Enstitusu (Edirne)")
rec("TR","lentil",None,20,30,45,60,0,30,
    "100% basal at sowing (0 DAS). Legume rhizobial starter only.",
    "TAGEM / T.C. Tarim ve Orman Bakanligi (Mercimek Yetistiriciligi Kilavuzu)",
    note="Ahmed: 'Thrace & All Regions' -> treated as national (null)")
rec("TR","chickpea",None,20,30,40,60,0,30,
    "100% basal before planting.",
    "TAGEM Tarla Bitkileri Merkez Arastirma Enstitusu")
rec("TR","sunflower",None,70,90,45,60,30,50,
    "50% N + full P/K basal at sowing; 50% N at 6-8 leaf stage (ilk capa).",
    "TAGEM Trakya Tarimsal Arastirma Enstitusu (Tekirdag/Edirne)")
rec("TR","maize","Southeast Anatolia",180,240,70,90,50,80,
    "30% N, full P/K basal; balance N split at V6 knee-high stage and V10 tasseling.",
    "Gaziantep Il Tarim ve Orman Mudurlugu / GAPTAEM Sanliurfa")
rec("TR","barley","Southeast Anatolia",70,100,45,65,0,30,
    "40% N + full P basal; 60% N spring tillering (kardeslenme).",
    "Gaziantep Il Tarim ve Orman Mudurlugu / GAPTAEM")
rec("TR","wheat",None,100,140,50,70,0,40,
    "1/3 N + full P basal; 2/3 N spring tillering and stem elongation.",
    "TAGEM (Tarimsal Arastirmalar ve Politikalar Genel Mudurlugu)")

# ============ 2. POLAND (PL) ============
PL_AUTH = "InHort Skierniewice (Instytut Ogrodnictwa - PIB) / IUNG-PIB Pulawy"
rec("PL","cabbage",None,180,240,60,90,160,220,
    "40% N, full P, 50% K basal; balance N and K split 30 DAT and head formation. Gov ceiling gross N: up to 300 kg/ha net of soil mineral N.",
    PL_AUTH + " / Rada Ministrow / MRiRW")
rec("PL","garlic",None,100,130,60,80,90,130,
    "Full P/K + 30% N autumn planting (Oct); balance N split in April and May.",
    PL_AUTH + " / MRiRW")
rec("PL","peas",None,30,45,50,70,60,80,
    "100% NPK basal before sowing.",
    PL_AUTH)
rec("PL","radish",None,50,80,40,60,60,90,
    "100% basal incorporated into seedbed.",
    PL_AUTH)
rec("PL","brinjal",None,140,180,70,100,140,200,
    "40% N, full P, 40% K basal; balance top-dressed/fertigated in tunnels.",
    PL_AUTH)
rec("PL","chili",None,130,170,60,90,140,200,
    "50% N, full P, 50% K basal; balance split at flowering and fruit sizing.",
    PL_AUTH)
rec("PL","cauliflower",None,180,240,70,100,160,220,
    "40% N, full P, 50% K basal; balance split at rosette closure and curd initiation.",
    PL_AUTH)
rec("PL","carrot",None,90,130,50,80,140,200,
    "Full P, 50% K, 40% N basal; balance N/K split after thinning.",
    PL_AUTH)
rec("PL","spinach",None,80,120,45,65,80,120,
    "Full P/K + 50% N basal; 50% N at 3-leaf stage.",
    PL_AUTH)
rec("PL","potato",None,120,160,60,90,140,200,
    "Full P, 50% K, 50% N at planting; balance at emergence/hilling.",
    "IHAR-PIB Jadwisin / IUNG-PIB Pulawy")
rec("PL","onion",None,120,160,60,85,120,180,
    "Full P, 50% K, 40% N basal; balance N split at 3-4 leaves and early bulbing.",
    PL_AUTH)
rec("PL","tomato",None,140,180,70,100,180,240,
    "40% N, full P, 50% K basal; balance in 2 splits after fruit set.",
    PL_AUTH)
rec("PL","sugar-beet",None,110,150,60,85,160,220,
    "Full P/K + 40% N basal; 60% N before 6-leaf stage.",
    "IUNG-PIB Pulawy")
rec("PL","barley",None,80,120,45,65,60,90,
    "Full P/K + 40% N basal; 60% N spring tillering.",
    "IUNG-PIB Pulawy")

# ============ 3. SPAIN (ES) ============
ES_AUTH = "MAPA (Guia Practica de la Fertilizacion Racional de los Cultivos en Espana)"
rec("ES","carrot",None,100,140,50,75,150,220,
    "30% N, full P/K basal; balance N/K post-thinning.",
    ES_AUTH + " / IVIA")
rec("ES","radish",None,50,75,35,50,45,70,
    "100% basal.",
    ES_AUTH)
rec("ES","peas",None,25,40,45,65,50,70,
    "100% basal.",
    ES_AUTH)
rec("ES","spinach",None,80,120,40,60,80,120,
    "50% basal, 50% at 3-4 leaves.",
    ES_AUTH + " / IVIA")
rec("ES","cauliflower",None,150,200,60,90,130,180,
    "30% N basal; remainder fertigated.",
    ES_AUTH + " / IVIA")
rec("ES","cabbage-chinese",None,120,160,50,70,100,140,
    None,
    ES_AUTH + " / IMIDA")
rec("ES","cabbage",None,140,190,60,85,120,170,
    None,
    ES_AUTH)
rec("ES","chili",None,160,220,70,100,160,230,
    None,
    ES_AUTH + " / IVIA")
rec("ES","brinjal",None,140,190,60,90,140,200,
    None,
    ES_AUTH + " / IVIA")
rec("ES","onion",None,120,160,60,80,110,160,
    None,
    ES_AUTH + " / IVIA")
rec("ES","tomato",None,180,240,80,120,180,270,
    None,
    ES_AUTH + " / IVIA")
rec("ES","sugar-beet",None,120,160,60,85,140,200,
    None,
    ES_AUTH + " / AIMCRA")
rec("ES","potato",None,160,220,90,140,200,280,
    None,
    "ITACyL / MAPA")
rec("ES","rice",None,120,160,45,65,40,60,
    "60% N + full P/K basal; 40% N at panicle initiation.",
    "IRTA / RuralCat / MAPA",
    note="Ahmed: 'All Regions / Delta Ebro / Sevilla' -> treated as national (null)")
rec("ES","olive","Andalucía",60,100,25,40,80,130,
    None,
    ES_AUTH + " / IFAPA")
rec("ES","sunflower",None,50,75,35,55,35,55,
    "100% basal.",
    "CITA Aragon / MAPA",
    note="Ahmed: 'Aragon & All Regions' -> treated as national (null)")
rec("ES","maize",None,240,320,85,120,110,160,
    None,
    "INTIA / IRTA / MAPA",
    note="Ahmed: 'Aragon & All Regions' -> treated as national (null)")

if __name__ == "__main__":
    with open("import_part1.json", "w", encoding="utf-8") as f:
        json.dump(R, f, ensure_ascii=False, indent=1)
    print(f"Part 1: {len(R)} records")
