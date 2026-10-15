#!/usr/bin/env python3
"""Parse Ahmed's 2026-10-15 NPK data (part 3: CN, MY/ID, AU/BR) into JSON records."""
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

# ============ 7. CHINA (CN) ============
rec("CN","garlic","North China Plain",150,200,70,100,120,160,None,
    "Henan/Shandong Academy of Agricultural Sciences",
    note="Ahmed: 'North China Plain (Shandong/Henan)'")
rec("CN","chili","Yangtze River Basin",140,180,60,90,120,160,None,
    "Anhui Provincial DB / HBAAS",
    note="Ahmed: 'Yangtze River Basin (Anhui/Hubei)'")
rec("CN","spinach","Northeast",70,90,35,50,35,50,None,
    "Jilin DB Standard",
    note="Ahmed: 'Northeast (Jilin/Heilongjiang)'")
rec("CN","carrot","South China",120,160,60,80,150,210,None,
    "FAAS / GDAAS",
    note="Ahmed: 'South China (Fujian/Guangdong)'. DB had uncalibrated 330 kg N; verified institutional cap 160 kg N.")
rec("CN","potato","Yangtze & Southwest",120,160,60,90,120,180,None,
    "Chongqing DB / Yunnan AAS",
    note="Ahmed: 'Yangtze & Southwest (Chongqing/Yunnan)'")
rec("CN","tomato","Yangtze Basin",180,230,80,120,180,260,None,
    "Anhui AAS / CAAS",
    note="Ahmed: 'Yangtze Basin (Anhui)'. DB had uncalibrated 648 kg N; standard open/tunnel crop limit 230 kg N.")
rec("CN","sugarcane","South China",200,260,80,120,160,240,None,
    "Guangxi AAS Sugarcane Institute / DB45",
    note="Ahmed: 'South (Guangxi / Hainan)'")
rec("CN","canola",None,120,160,50,75,60,90,
    "+ 10 kg Borax.",
    "CAAS Oil Crops Research Institute / Sichuan DB",
    note="Ahmed: 'Yangtze & All Regions' -> treated as national (null)")
rec("CN","cotton",None,160,220,60,90,75,110,None,
    "CAAS Cotton Research / Hebei DB",
    note="Ahmed: 'Xinjiang & North China Plain (Hebei)' -> treated as national (null)")
rec("CN","soybean",None,25,40,45,65,45,65,None,
    "Heilongjiang DB / Hebei DB",
    note="Ahmed: 'North Plain & Northeast' -> treated as national (null)")
rec("CN","maize",None,160,210,50,75,60,90,None,
    "Hebei DB / MARA",
    note="Ahmed: 'North China Plain (Hebei) & Southwest' -> treated as national (null)")
rec("CN","wheat",None,160,200,65,90,50,80,None,
    "Hebei DB / Shaanxi DB",
    note="Ahmed: 'North Plain (Hebei) & Shaanxi' -> treated as national (null)")
rec("CN","rice",None,110,145,45,65,50,75,None,
    "Jilin Agriculture Commission / CAAS",
    note="Ahmed: 'Northeast (Jilin) & All Regions' -> treated as national (null)")

# ============ 8. MALAYSIA (MY) & INDONESIA (ID) ============
rec("MY","okra","Sabah",100,120,60,80,80,100,None,
    "Jabatan Pertanian Sabah / MARDI")
rec("MY","okra","Peninsular",80,100,50,65,60,80,None,
    "MARDI Manual Penanaman Bendi")
rec("MY","rice","Peninsular",100,130,40,60,40,60,None,
    "MARDI / DOA Malaysia")
rec("ID","cabbage-chinese",None,90,120,50,70,60,80,None,
    "Balitsa / BSIP Hortikultura",
    note="Ahmed: 'Chinese Cabbage (Sawi Putih)', Indonesia National")
rec("ID","spinach",None,60,80,30,45,30,45,None,
    "Balitsa",
    note="Ahmed: 'Spinach (Bayam)', Indonesia National")
rec("ID","brinjal",None,90,120,60,80,60,90,None,
    "Balitsa",
    note="Ahmed: 'Brinjal (Terung)', Indonesia National")
rec("ID","carrot",None,50,65,45,60,60,80,None,
    "Balitsa",
    note="Ahmed: 'Carrot (Wortel)', Indonesia National")
rec("ID","cauliflower",None,110,140,60,80,60,85,None,
    "Balitsa",
    note="Ahmed: 'Cauliflower (Kembang Kol)', Indonesia National")
rec("ID","cabbage",None,110,140,60,80,60,85,None,
    "Balitsa",
    note="Ahmed: 'Cabbage (Kubis)', Indonesia National")
rec("ID","potato",None,130,160,90,120,120,160,None,
    "Balitsa Lembang",
    note="Ahmed: 'Potato (Kentang)', 'Java / National' -> treated as national (null)")
rec("ID","shallot",None,90,120,50,70,60,85,
    "+ 15 kg S.",
    "Balitsa",
    note="Ahmed: 'Onion / Shallot (Bawang Merah)' -> mapped to shallot (Bawang Merah = shallot); AMBIGUOUS, flagged")
rec("ID","tomato","Kalimantan",90,120,80,110,80,100,
    "+ Dolomite.",
    "BPTP Kalsel / Balitbangtan")
rec("ID","groundnut",None,25,35,40,55,35,50,None,
    "Balitkabi Malang / BSIP",
    note="Ahmed: 'Groundnut (Kacang Tanah)', All Regions")
rec("ID","cassava",None,80,110,40,60,90,130,None,
    "Balitkabi / BSIP",
    note="Ahmed: 'Cassava (Singkong)', All Regions")
rec("ID","sugarcane",None,120,150,60,90,90,135,None,
    "P3GI Pasuruan / Balitbangtan",
    note="Ahmed: 'Sugarcane (Tebu)', All Regions")
rec("ID","rice",None,90,125,36,54,40,60,None,
    "BSIP Padi Sukamandi",
    note="Ahmed: 'Rice (Padi Sawah)', All Regions")

# ============ 9. AUSTRALIA (AU) & BRAZIL (BR) ============
rec("AU","garlic","New South Wales",110,145,60,85,100,140,None,
    "NSW DPI / AGIA")
rec("AU","carrot","Western Australia",110,150,60,85,150,220,None,
    "DPIRD WA Bulletin 4734")
rec("AU","onion",None,130,170,65,90,110,160,None,
    "Hort Innovation / Onions Australia")
rec("AU","sorghum",None,60,100,25,40,0,30,None,
    "GRDC",
    note="Ahmed: 'National / WA' -> treated as national (null)")
rec("AU","canola",None,75,130,30,50,0,40,
    "+ 20 kg S.",
    "GRDC",
    note="Ahmed: 'National / WA' -> treated as national (null)")
rec("AU","barley",None,50,85,25,40,0,30,None,
    "GRDC",
    note="Ahmed: 'National / WA' -> treated as national (null)")
rec("AU","wheat",None,60,110,25,45,0,40,None,
    "GRDC",
    note="Ahmed: 'National / WA' -> treated as national (null)")
rec("BR","spinach","Southeast",80,110,40,70,60,100,None,
    "IAC",
    note="Ahmed: 'Southeast (SP/MG)'")
rec("BR","tomato","Southeast",180,250,150,300,180,300,None,
    "CFSEMG / IAC",
    note="Ahmed: 'Tomato (Mesa / Industria)', Southeast (SP/MG). DB had uncalibrated 800 kg P2O5; standard 150-300.")
rec("BR","cabbage","Southeast",120,160,100,200,100,160,None,"CFSEMG")
rec("BR","okra","Southeast",80,110,60,120,80,120,None,"CFSEMG")
rec("BR","chili","Southeast",110,150,80,160,100,160,None,"CFSEMG")
rec("BR","cauliflower","Southeast",140,180,120,200,120,180,None,"CFSEMG")
rec("BR","carrot","Southeast",90,130,100,180,120,180,None,"CFSEMG")
rec("BR","onion","Southeast",100,130,100,180,90,140,None,"CFSEMG")
rec("BR","brinjal","Southeast",100,140,80,140,90,140,None,"CFSEMG")
rec("BR","potato","Southeast",140,190,150,250,140,220,None,"CFSEMG")
rec("BR","garlic","Southeast",80,120,80,150,60,100,None,"CFSEMG")
rec("BR","beans","Southeast",60,90,40,70,30,50,None,
    "Embrapa Arroz e Feijao / CFSEMG",
    note="Ahmed: 'Beans (Feijao)' -> mapped to 'beans'; AMBIGUOUS vs 'bean', flagged")
rec("BR","rice","Southeast",50,80,40,70,30,50,None,
    "Embrapa Rondonia")
rec("BR","coffee","Southeast",200,300,40,80,200,300,None,
    "CFSEMG / UFV",
    note="Ahmed: 'Coffee (Cafe Arabica)'")
rec("BR","sugarcane","Southeast",100,140,30,50,120,160,None,
    "IAC Boletim 100 / Copersucar",
    note="Ahmed: 'Sugarcane (Cana-de-acucar)'")
rec("BR","maize","Southeast",120,160,50,80,40,70,None,
    "Embrapa Milho e Sorgo",
    note="Ahmed: 'Maize (Milho Cerrado)'")

if __name__ == "__main__":
    with open("import_part3.json", "w", encoding="utf-8") as f:
        json.dump(R, f, ensure_ascii=False, indent=1)
    print(f"Part 3: {len(R)} records")
