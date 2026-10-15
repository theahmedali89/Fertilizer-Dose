#!/usr/bin/env python3
"""Parse Ahmed's 2026-10-15 NPK data (part 2: FR, DE, IT/KR/JP) into JSON records."""
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

# ============ 4. FRANCE (FR) ============
rec("FR","radish",None,40,65,30,45,40,65,"100% basal.","CTIFL")
rec("FR","peas",None,25,40,45,65,50,75,"100% basal.","CTIFL / Terres Inovia")
rec("FR","brinjal",None,130,170,60,90,140,200,None,"CTIFL")
rec("FR","chili",None,130,170,60,90,150,210,None,"CTIFL")
rec("FR","cauliflower",None,170,230,65,95,140,200,None,"CTIFL")
rec("FR","spinach",None,90,130,45,65,80,120,None,"CTIFL / COMIFER")
rec("FR","carrot",None,90,130,55,80,140,200,None,"CTIFL")
rec("FR","potato",None,140,190,70,110,160,240,None,"ARVALIS - Institut du vegetal")
rec("FR","onion",None,110,150,55,80,110,160,None,"CTIFL")
rec("FR","tomato",None,150,200,70,100,160,240,None,"CTIFL")
rec("FR","soybean",None,0,0,45,65,50,75,"Strict 0 N inoculation.","Terres Inovia")
rec("FR","sugar-beet",None,110,150,60,85,160,240,None,"ITB / COMIFER")
rec("FR","sunflower",None,50,80,40,55,45,65,None,"Terres Inovia")
rec("FR","canola",None,150,210,60,90,70,110,"+ 60 kg SO3.","Terres Inovia")
rec("FR","barley",None,130,170,45,65,50,75,None,"ARVALIS - Institut du vegetal")
rec("FR","wheat",None,170,240,50,75,50,80,"In 3 splits.","ARVALIS / COMIFER")

# ============ 5. GERMANY (DE) ============
DUV = "Dungeverordnung (DuV Anlage 4)"
rec("DE","potato",None,140,180,65,90,180,260,None,DUV + " / LfL Bayern")
rec("DE","radish",None,60,90,35,55,50,80,"DuV ceiling 110 kg N.",DUV)
rec("DE","garlic",None,90,120,50,70,80,120,"DuV 120 kg N.",DUV)
rec("DE","spinach",None,100,140,45,65,80,120,"DuV gross 190 kg N.",DUV)
rec("DE","onion",None,110,140,50,75,120,160,None,DUV + " / LfL")
rec("DE","carrot",None,90,130,50,75,140,200,None,DUV + " / LWK Niedersachsen")
rec("DE","cabbage-chinese",None,130,170,50,70,120,160,"DuV ceiling 210 kg N.",DUV)
rec("DE","cabbage",None,160,210,60,85,130,180,None,DUV + " / LfL")
rec("DE","cauliflower",None,180,240,70,95,140,200,"DuV ceiling 300 kg N.",DUV)
rec("DE","triticale","Niedersachsen & Bayern",130,180,55,75,80,120,None,"LfL Bayern / LWK Niedersachsen")
rec("DE","rye","Niedersachsen & Bayern",120,160,50,75,90,140,None,"LfL Bayern / LWK Niedersachsen")
rec("DE","sugar-beet","Bayern",120,160,70,100,180,280,None,"LfL Bayern")
rec("DE","canola","Niedersachsen & Bayern",160,200,70,100,120,180,None,"LfL Bayern / LWK Niedersachsen")
rec("DE","maize","Bayern",160,200,70,95,140,200,None,"LfL Bayern")
rec("DE","barley","Niedersachsen & Bayern",130,170,55,75,80,125,None,"LfL Bayern / LWK Niedersachsen")
rec("DE","wheat","Niedersachsen & Bayern",170,220,65,85,90,135,None,"LfL Bayern / LWK Niedersachsen")

# ============ 6. ITALY / KOREA / JAPAN ============
rec("IT","chili","Emilia-Romagna",140,170,65,85,180,240,None,"Regione Emilia-Romagna")
rec("KR","chili","Gangwon",160,190,80,100,120,150,None,"Gangwon ARES / RDA")
rec("JP","cabbage","Chubu",180,220,150,200,180,220,None,"Gifu ARES / MAFF",
    note="Ahmed: 'Chubu (Gifu)'")
rec("JP","cabbage","Tohoku",200,245,220,280,170,210,None,"Yamagata Prefecture / MAFF",
    note="Ahmed: 'Tohoku (Yamagata)'")
rec("JP","chili","Tohoku",240,300,250,320,220,280,None,"Yamagata Prefecture",
    note="Ahmed: 'Chili / Shishito', Tohoku (Yamagata)")
rec("KR","wheat","Chungcheong",90,110,60,80,40,60,None,"NICS / RDA")
rec("KR","sesame",None,60,80,40,50,40,55,None,"Jeju ARES / RDA")
rec("KR","sweet-potato",None,45,60,45,65,100,140,None,"RDA")
rec("KR","potato",None,90,120,80,100,100,130,None,"RDA")
rec("KR","maize",None,140,180,60,80,80,100,None,"RDA")
rec("KR","soybean",None,25,35,40,60,40,60,None,"RDA")
rec("KR","barley",None,70,95,50,70,40,60,None,"Chungnam ARES / RDA",
    note="Ahmed: 'Chungcheong & National' -> treated as national (null)")
rec("KR","rice","Gyeongsang",80,100,40,55,50,70,None,"Gyeongnam ARES")
rec("JP","buckwheat","Tohoku",30,45,40,60,35,50,None,"Yamagata Prefecture / JA",
    note="Ahmed: 'Tohoku (Yamagata)'")
rec("JP","sweet-potato","Kanto",30,50,60,90,90,130,None,"Ibaraki Prefectural ARES",
    note="Ahmed: 'Kanto (Ibaraki)'")
rec("JP","soybean",None,20,30,60,80,60,80,None,"Niigata ARES / Yamagata",
    note="Ahmed: 'Chubu (Niigata) & Tohoku' -> treated as national (null)")
rec("JP","wheat",None,100,140,80,120,70,100,None,"Hokkaido HRO / Yamagata",
    note="Ahmed: 'Tohoku & Hokkaido' -> treated as national (null)")
rec("JP","rice","Tohoku",70,95,60,85,70,95,None,"MAFF / Yamagata ARES",
    note="Ahmed: 'Tohoku (Yamagata)'")

if __name__ == "__main__":
    with open("import_part2.json", "w", encoding="utf-8") as f:
        json.dump(R, f, ensure_ascii=False, indent=1)
    print(f"Part 2: {len(R)} records")
