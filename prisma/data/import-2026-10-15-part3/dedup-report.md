# Dedup Report — Import 2026-10-15 Part 3 (Ahmed's multilingual crop dictionary)

> **Method:** Parsed 1,224 records (68 items × 18 locales; `en` skipped as base language)
> from Ahmed's message. Names cleaned: native script only (romanized transliterations in
> parentheses stripped), first `/`-variant kept. Dedup checked against
> `prisma/data/translations.json` (990 records, 18 locales × 55 items) as DB proxy.
> **Nothing imported — analysis only.**

## Summary

| Category | Count | Meaning |
|---|---|---|
| Total parsed | 1,224 | 68 items × 18 locales |
| NEW-LOCALE (bg, sv) | 136 | bg + sv don't exist yet — all 68 items × 2 locales are new |
| NEW-ITEM-LOCALE | 208 | 13 items have no translations at all — 16 existing locales each |
| DUPLICATE-SAME | 620 | Identical to existing — safe no-op |
| DUPLICATE-DIFFERENT (case-only) | 77 | Same word, different capitalization (e.g. `Frijoles` vs `frijoles`) |
| DUPLICATE-DIFFERENT (real) | 183 | Genuinely different wording — **needs Ahmed's call** |
| UNMAPPED-ITEM | 0 | All 68 items mapped to existing GrowingItem slugs |

### Items with zero existing translations (13) — all 18 locales importable as new

`alfalfa`, `bean`, `chinese-cabbage`, `cocoa`, `cowpea`, `finger-millet`, `lupins`, `mung-bean`, `pearl-millet`, `pepper`, `pigeon-pea`, `shallot`, `yam`

### Slug-mapping decisions (ambiguous cases)

| Ahmed's label | Mapped slug | Rationale |
|---|---|---|
| Chinese Cabbage | `cabbage-chinese` | Matches existing ES/DE vegdose records (part-2 convention) |
| Chinese Cabbage (Napa) | `chinese-cabbage` | Part-2 convention (`chinese-cabbage` = Napa/heading type) |
| Napa Cabbage | `napa-cabbage` | Direct match |
| Common Bean (Rajmash/Cowpea) | `bean` | Singular `bean` vs plural `beans` vs `cowpea` (separate entries) |
| Beans | `beans` | Direct match |
| Cowpea | `cowpea` | Direct match |
| Citrus (Orange) | `citrus` | Existing slug |
| Natural Rubber | `rubber` | Existing slug |
| Oil Palm | `palm-oil` | Existing slug |
| Chili / Hot Pepper | `chili` | Existing slug (`pepper` = bell pepper, separate) |
| Pepper | `pepper` | Existing slug (bell/sweet pepper) |

## DUPLICATE-DIFFERENT — real content differences (183)

> Per Ahmed's rule these must NOT be blindly overwritten. He decides per row (or per pattern).

| # | Slug | Locale | Ahmed's value | Existing value |
|---|---|---|---|---|
| 1 | barley | bn | বার্লি | যব |
| 2 | beans | ur | پھلیاں | لوبیا |
| 3 | beans | hi | फलियां | लोबिया |
| 4 | beans | bn | শিম | সিম |
| 5 | beans | id | Kacang-kacangan | kacang |
| 6 | brinjal | id | Terung | Terong |
| 7 | buckwheat | ur | کٹو | بکویٹ |
| 8 | buckwheat | es | Alforfón | trigo sarraceno |
| 9 | buckwheat | it | Grano sarraceno | grano saraceno |
| 10 | buckwheat | ja | ソバ | そば |
| 11 | buckwheat | ms | Gandum kuda | buckwheat |
| 12 | buckwheat | id | Gandum kuda | buckwheat |
| 13 | cabbage | hi | पत्ता गोभी | पत्तागोभी |
| 14 | cabbage | ru | Капуста белокочанная | Капуста |
| 15 | cabbage | fr | Chou cabus | Chou |
| 16 | cabbage | de | Kopfkohl | Weißkohl |
| 17 | cabbage | it | Cavolo cappuccio | Cavolo |
| 18 | cabbage | ms | Kubis bulat | Kobis |
| 19 | cabbage | pl | Kapusta głowiasta | Kapusta |
| 20 | canola | hi | कनोला | कैनोला |
| 21 | canola | es | Colza | Canola |
| 22 | canola | fr | Colza | Canola |
| 23 | canola | it | Colza | Canola |
| 24 | canola | pt | Colza | Canola |
| 25 | canola | ja | キャノーラ | 菜種 |
| 26 | canola | ko | 카놀라 | 유채 |
| 27 | cassava | ur | کساوا | کاساوا |
| 28 | cassava | ru | Маниок | кассава |
| 29 | chickpea | ja | ヒヨコマメ | ヒヨコ豆 |
| 30 | chili | ur | سرخ مرچ | مرچ |
| 31 | chili | ru | Острый перец | Перец чили |
| 32 | chili | pl | Papryka ostra | Papryczka chili |
| 33 | cabbage-chinese | hi | चीनी पत्तागोभी | चीनी पत्ता गोभी |
| 34 | cabbage-chinese | de | Pak Choi | Chinakohl |
| 35 | cabbage-chinese | bn | চীনা বাঁধাকপি | চাইনিজ বাঁধাকপি |
| 36 | cabbage-chinese | ja | チンゲンサイ | 白菜 |
| 37 | cabbage-chinese | ko | 청경채 | 배추 |
| 38 | cabbage-chinese | ms | Sawi cina | kobis cina |
| 39 | cabbage-chinese | id | Sawi sendok | sawi putih |
| 40 | citrus | es | Naranja | Cítrico |
| 41 | citrus | ru | Апельсин | Цитрус |
| 42 | citrus | fr | Orange | Agrume |
| 43 | citrus | de | Orange | Zitrusfrucht |
| 44 | citrus | it | Arancia | Agrume |
| 45 | citrus | pt | Laranja | Citrino |
| 46 | citrus | ja | オレンジ | 柑橘類 |
| 47 | citrus | ko | 오렌지 | 감귤류 |
| 48 | citrus | ms | Oren | Limau |
| 49 | citrus | pl | Pomarańcza | Cytrus |
| 50 | citrus | id | Jeruk manis | Jeruk |
| 51 | citrus | ar | برتقال | حمضيات |
| 52 | citrus | tr | Portakal | Turunçgil |
| 53 | coconut | it | Cocco | noce di cocco |
| 54 | coffee | hi | अरेबिका कॉफी | कॉफ़ी |
| 55 | coffee | es | Café Arábica | Café |
| 56 | coffee | ru | Кофе арабика | Кофе |
| 57 | coffee | fr | Café Arabica | Café |
| 58 | coffee | de | Arabica-Kaffee | Kaffee |
| 59 | coffee | it | Caffè arabica | Caffè |
| 60 | coffee | pt | Café arábica | Café |
| 61 | coffee | bn | অ্যারাবিকা কফি | কফি |
| 62 | coffee | ja | アラビカコーヒー | コーヒー |
| 63 | coffee | ko | 아라비카 커피 | 커피 |
| 64 | coffee | ms | Kopi Arabika | Kopi |
| 65 | coffee | pl | Kawa arabika | Kawa |
| 66 | coffee | id | Kopi arabika | Kopi |
| 67 | coffee | ar | قهوة عربية | قهوة |
| 68 | coffee | tr | Arabica kahvesi | Kahve |
| 69 | cotton | ru | Хлопчатник | Хлопок |
| 70 | cotton | ja | ワタ | 綿 |
| 71 | cucumber | id | Mentimun | Timun |
| 72 | daikon | ur | سفید مولی | جاپانی مولی |
| 73 | daikon | es | Rábano daikon | Rábano japonés |
| 74 | daikon | fr | Radis blanc | Radis japonais |
| 75 | daikon | it | Daikon | Ravanello giapponese |
| 76 | daikon | pt | Nabo-daikon | Rabanete japonês |
| 77 | daikon | bn | জাপানি মুলো | জাপানি মুলা |
| 78 | daikon | ko | 무 | 일본무 |
| 79 | daikon | ms | Lobak putih jepun | Lobak jepun |
| 80 | durum-wheat | ur | ڈورم گندم | ڈیورم گندم |
| 81 | durum-wheat | hi | ड्यूरम गेहूं | ड्यूरम गेहूँ |
| 82 | durum-wheat | pt | Trigo-duro | Trigo duro |
| 83 | durum-wheat | bn | ডুরম গম | ডুরাম গম |
| 84 | durum-wheat | pl | Pszenica twarda | Pszenica durum |
| 85 | durum-wheat | ar | قمح صلب | قمح الديورم |
| 86 | durum-wheat | tr | Makarnalık buğday | Durum buğdayı |
| 87 | grape | pl | Winogrono | Winogrona |
| 88 | groundnut | es | Cacahuate | Maní |
| 89 | jute | ur | پٹ سن | پٹسن |
| 90 | jute | hi | पटसन | जूट |
| 91 | lentil | bn | মসুর ডাল | মসুর |
| 92 | lentil | ko | 렌틸콩 | 렌즈콩 |
| 93 | lentil | id | Miju-miju | Kacang lentil |
| 94 | marigold | ur | گیندے کا پھول | گیندا |
| 95 | marigold | es | Caléndula | Tagete |
| 96 | marigold | fr | Tagète | Œillet d'Inde |
| 97 | marigold | de | Tagetes | Ringelblume |
| 98 | marigold | pt | Cravo-de-defunto | Tagetes |
| 99 | marigold | bn | গাঁদা ফুল | গাঁদা |
| 100 | marigold | id | Bunga marigold | Bunga tahi ayam |
| 101 | marigold | ar | مخملية | قطيفة |
| 102 | millet | ur | کَنگنی | باجرہ |
| 103 | millet | hi | कांगणी | बाजरा |
| 104 | millet | bn | চীনা কাউন | বাজরা |
| 105 | millet | ja | キビ | きび |
| 106 | millet | ko | 조 | 기장 |
| 107 | millet | id | Milet | jawawut |
| 108 | money-plant | es | Poto | Potos |
| 109 | money-plant | ru | Эпипремнум золотистый | Эпипремнум |
| 110 | money-plant | pt | Jibóia | Jiboia |
| 111 | money-plant | pl | Epipremnum złociste | Epipremnum |
| 112 | money-plant | ar | بوتس | نبتة المال |
| 113 | money-plant | tr | Salon sarmaşığı | Para çiçeği |
| 114 | mustard | ms | Biji sawi | Sawi |
| 115 | mustard | id | Sesawi | Sawi |
| 116 | napa-cabbage | ur | ناپا بند گوبھی | چینی گوبھی |
| 117 | napa-cabbage | hi | नापा गोभी | चीनी गोभी |
| 118 | napa-cabbage | es | Col de Napa | Col china |
| 119 | napa-cabbage | fr | Chou Napa | Chou chinois |
| 120 | napa-cabbage | it | Cavolo Napa | Cavolo cinese |
| 121 | napa-cabbage | pt | Couve Napa | Repolho chinês |
| 122 | napa-cabbage | ja | 白菜 | ハクサイ |
| 123 | napa-cabbage | ms | Kobis Napa | Kobis cina |
| 124 | napa-cabbage | ar | كرنب نابا | ملفوف صيني |
| 125 | napa-cabbage | tr | Napa lahanası | Çin lahanası |
| 126 | rubber | ur | ربڑ کا درخت | قدرتی ربڑ |
| 127 | neem | fr | Margousier | Neem |
| 128 | neem | de | Niembaum | Neembaum |
| 129 | neem | ms | Pokok semambu | Mambu |
| 130 | neem | tr | Nim ağacı | Neem ağacı |
| 131 | oats | ja | エンバク | オーツ麦 |
| 132 | oats | id | Gandum haver | oat |
| 133 | palm-oil | es | Palma de aceite | Palma aceitera |
| 134 | palm-oil | pt | Dendezeiro | Palmeira de dendê |
| 135 | palm-oil | bn | তেল পাম | অয়েল পাম |
| 136 | palm-oil | pl | Olejowiec gwinejski | Palma olejowa |
| 137 | okra | es | Quimbombó | Okra |
| 138 | okra | ru | Окра | Бамия |
| 139 | okra | bn | ঢেঁড়শ | ঢেঁড়স |
| 140 | olive | it | Oliva | Olivo |
| 141 | onion | hi | प्याज | प्याज़ |
| 142 | onion | ru | Лук репчатый | Лук |
| 143 | onion | id | Bawang bombay | Bawang bombai |
| 144 | peas | es | Guisantes | Guisante |
| 145 | peas | fr | Petits pois | Pois |
| 146 | peas | de | Erbsen | Erbse |
| 147 | peas | it | Piselli | Pisello |
| 148 | peas | pt | Ervilhas | Ervilha |
| 149 | peas | bn | মটরশুঁটি | মটরশুটি |
| 150 | peas | ja | エンドウ豆 | エンドウ |
| 151 | potato | es | Patata | Papa |
| 152 | potato | ms | Ubi kentang | Kentang |
| 153 | radish | bn | মূলা | মুলা |
| 154 | radish | ms | Lobak putih | Lobak |
| 155 | rice | ur | دھان | چاول / دھان |
| 156 | rice | ja | イネ | 稲 |
| 157 | rose | ms | Bunga mawar | Ros |
| 158 | rye | ar | جودار | جاودار |
| 159 | sesame | ja | ゴマ | ごま |
| 160 | sorghum | ja | ソルガム | モロコシ |
| 161 | sorghum | ms | Sekoi | sorgum |
| 162 | sorghum | ar | ذرة بيضاء | ذرة رفيعة |
| 163 | soybean | ur | سویا بین | سویابین |
| 164 | soybean | ja | ダイズ | 大豆 |
| 165 | soybean | ko | 대두 | 콩 |
| 166 | spinach | it | Spinacio | Spinaci |
| 167 | spinach | bn | পালংশাক | পালং |
| 168 | spinach | ms | Bayam pasir | Bayam |
| 169 | spinach | id | Bayam jepang | Bayam |
| 170 | sugar-beet | pt | Beterraba-sacarina | Beterraba açucareira |
| 171 | sugar-beet | bn | সুগার বিট | চিনি বিট |
| 172 | sugar-beet | ja | テンサイ | 甜菜 |
| 173 | sugar-beet | ms | Bit gula | Ubi bit gula |
| 174 | sugar-beet | ar | بنجر السكر | شمندر سكري |
| 175 | sunflower | ar | عباد الشمس | دوار الشمس |
| 176 | sweet-potato | ur | شکر قندی | شکرقندی |
| 177 | sweet-potato | ja | サツマイモ | さつまいも |
| 178 | tomato | ru | Томат | Помидор |
| 179 | triticale | bn | ট্রিটিকেলে | ট্রিটিকেল |
| 180 | triticale | ja | ライ小麦 | トリティカーレ |
| 181 | triticale | ko | 라이밀 | 트리티케일 |
| 182 | triticale | ms | Tritikal | Tritikale |
| 183 | wheat | hi | गेहूं | गेहूँ |

## DUPLICATE-DIFFERENT — case-only (77, same word different capitalization)

| # | Slug | Locale | Ahmed's value | Existing value |
|---|---|---|---|---|
| 1 | beans | es | Frijoles | frijoles |
| 2 | beans | ru | Фасоль | фасоль |
| 3 | beans | fr | Haricots | haricots |
| 4 | beans | it | Fagioli | fagioli |
| 5 | beans | pt | Feijão | feijão |
| 6 | beans | ms | Kacang | kacang |
| 7 | beans | pl | Fasola | fasola |
| 8 | beans | tr | Fasulye | fasulye |
| 9 | buckwheat | ru | Гречиха | гречиха |
| 10 | buckwheat | fr | Sarrasin | sarrasin |
| 11 | buckwheat | pt | Trigo-sarraceno | trigo-sarraceno |
| 12 | buckwheat | pl | Gryka | gryka |
| 13 | buckwheat | tr | Karabuğday | karabuğday |
| 14 | cassava | es | Yuca | yuca |
| 15 | cassava | fr | Manioc | manioc |
| 16 | cassava | it | Manioca | manioca |
| 17 | cassava | pt | Mandioca | mandioca |
| 18 | cassava | ms | Ubi kayu | ubi kayu |
| 19 | cassava | pl | Maniok | maniok |
| 20 | cassava | id | Singkong | singkong |
| 21 | cassava | tr | Manyok | manyok |
| 22 | cabbage-chinese | es | Col china | col china |
| 23 | cabbage-chinese | ru | Китайская капуста | китайская капуста |
| 24 | cabbage-chinese | fr | Chou chinois | chou chinois |
| 25 | cabbage-chinese | it | Cavolo cinese | cavolo cinese |
| 26 | cabbage-chinese | pt | Couve-chinesa | couve-chinesa |
| 27 | cabbage-chinese | pl | Kapusta chińska | kapusta chińska |
| 28 | coconut | es | Coco | coco |
| 29 | coconut | ru | Кокос | кокос |
| 30 | coconut | fr | Noix de coco | noix de coco |
| 31 | coconut | pt | Coco | coco |
| 32 | coconut | ms | Kelapa | kelapa |
| 33 | coconut | pl | Kokos | kokos |
| 34 | coconut | id | Kelapa | kelapa |
| 35 | coconut | tr | Hindistan cevizi | hindistan cevizi |
| 36 | millet | es | Mijo | mijo |
| 37 | millet | ru | Просо | просо |
| 38 | millet | fr | Millet | millet |
| 39 | millet | it | Miglio | miglio |
| 40 | millet | pt | Milheto | milheto |
| 41 | millet | ms | Sekoi | sekoi |
| 42 | millet | pl | Proso | proso |
| 43 | millet | tr | Darı | darı |
| 44 | oats | es | Avena | avena |
| 45 | oats | ru | Овёс | овёс |
| 46 | oats | fr | Avoine | avoine |
| 47 | oats | it | Avena | avena |
| 48 | oats | pt | Aveia | aveia |
| 49 | oats | ms | Oat | oat |
| 50 | oats | pl | Owies | owies |
| 51 | oats | tr | Yulaf | yulaf |
| 52 | sesame | es | Sésamo | sésamo |
| 53 | sesame | ru | Кунжут | кунжут |
| 54 | sesame | fr | Sésame | sésame |
| 55 | sesame | it | Sesamo | sesamo |
| 56 | sesame | pt | Gergelim | gergelim |
| 57 | sesame | ms | Bijan | bijan |
| 58 | sesame | pl | Sezam | sezam |
| 59 | sesame | id | Wijen | wijen |
| 60 | sesame | tr | Susam | susam |
| 61 | sorghum | es | Sorgo | sorgo |
| 62 | sorghum | ru | Сорго | сорго |
| 63 | sorghum | fr | Sorgho | sorgho |
| 64 | sorghum | it | Sorgo | sorgo |
| 65 | sorghum | pt | Sorgo | sorgo |
| 66 | sorghum | pl | Sorgo | sorgo |
| 67 | sorghum | id | Sorgum | sorgum |
| 68 | sorghum | tr | Sorgum | sorgum |
| 69 | sweet-potato | es | Batata | batata |
| 70 | sweet-potato | ru | Батат | батат |
| 71 | sweet-potato | fr | Patate douce | patate douce |
| 72 | sweet-potato | it | Patata dolce | patata dolce |
| 73 | sweet-potato | pt | Batata-doce | batata-doce |
| 74 | sweet-potato | ms | Ubi keledek | ubi keledek |
| 75 | sweet-potato | pl | Batat | batat |
| 76 | sweet-potato | id | Ubi jalar | ubi jalar |
| 77 | sweet-potato | tr | Tatlı patates | tatlı patates |

## Recommended import batches (pending Ahmed's approval)

1. **Batch A — safe (344 records):** 136 NEW-LOCALE (bg/sv) + 208 NEW-ITEM-LOCALE. No conflicts.
2. **Batch B — case-only (77):** recommend normalizing to Ahmed's capitalization (or keep existing) — his call.
3. **Batch C — real diffs (183):** needs per-row/per-pattern decision. Common patterns: transliteration
   vs native word (bn `বার্লি` vs `যব`), spelling variants (`Terung`/`Terong`, `ソバ`/`そば`),
   synonym choice (`Alforfón` vs `trigo sarraceno`).
