base = open('product-mustard.html', encoding='utf-8').read()

def make_page(subs, price_map, out):
    p = base
    for a, b in subs:
        p = p.replace(a, b)
    for a, b in price_map:
        p = p.replace(a, b)
    open(out, 'w', encoding='utf-8').write(p)
    print('Written:', out)

# COCONUT
make_page([
    ('<title>Mustard Oil', '<title>Coconut Oil'),
    ('Lakdi Ghani Mustard Oil', 'Lakdi Ghani Coconut Oil'),
    ('Jiraso Lakdi Ghani Mustard Oil', 'Jiraso Lakdi Ghani Coconut Oil'),
    ('Asli kachi ghani sarson ka tel', 'Shudh nariyal ka tel'),
    ('Pure &amp; Traditional', 'Pure Tropical Oil'),
    ('bottle2.jpeg', 'bottle3.jpeg'),
    ('process1.png', 'process3.png'),
    ('156 reviews', '98 reviews'),
    ('product-mustard.html', 'product-coconut.html'),
    ('JIRASO Mustard Oil 1L', 'JIRASO Coconut Oil 1L'),
    ('JIRASO Mustard Oil', 'JIRASO Coconut Oil'),
    ('7899b4', 'c4a898'),
    ('f28388', 'fcc9a4'),
    ('Raspberry Ginger', 'Peach Chamomile'),
    ("Bold, pungent oil perfect for traditional Indian cooking.", "Pure tropical oil for cooking, skin, and health."),
    ('Meera Singh', 'Rekha Rao'),
    ("reminds me of my grandmother's cooking", 'Perfect for hair and cooking both'),
    ('Amit Gupta', 'Arun Sharma'),
    ('Best quality mustard oil', 'Best coconut oil I have tried'),
    ('Kavita Reddy', 'Deepa Menon'),
    ('Never going back to refined oil', 'Use it for skin care too'),
    ('Suresh Kumar', 'Vivek Sinha'),
    ('Great purity and taste', 'Very pure and fresh aroma'),
    ('100% Pure Wood Pressed Mustard Oil', '100% Pure Wood Pressed Coconut Oil'),
    ('Rich in Omega-3 &amp; Omega-6', 'Rich in Lauric Acid &amp; MCTs'),
    ('Traditional Kachi Ghani Method', 'Natural Cold Press Method'),
    ('currentPrice = 450', 'currentPrice = 550'),
], [
    ('\u20b9135', '\u20b9160'), ('\u20b9250', '\u20b9300'), ('\u20b9450', '\u20b9550'),
    ('selectSize(this,135)', 'selectSize(this,160)'),
    ('selectSize(this,250)', 'selectSize(this,300)'),
    ('selectSize(this,450)', 'selectSize(this,550)'),
    ('>&#x20B9;450', '>&#x20B9;550'),
    ('>Rs.450', '>Rs.550'),
], 'product-coconut.html')

# GROUNDNUT
make_page([
    ('<title>Mustard Oil', '<title>Groundnut Oil'),
    ('Lakdi Ghani Mustard Oil', 'Lakdi Ghani Groundnut Oil'),
    ('Jiraso Lakdi Ghani Mustard Oil', 'Jiraso Lakdi Ghani Groundnut Oil'),
    ('Asli kachi ghani sarson ka tel', 'Shudh moongphali ka tel'),
    ('Pure &amp; Traditional', 'Light &amp; Versatile'),
    ('bottle2.jpeg', 'bottle5.jpeg'),
    ('process1.png', 'process3.png'),
    ('156 reviews', '84 reviews'),
    ('product-mustard.html', 'product-groundnut.html'),
    ('JIRASO Mustard Oil 1L', 'JIRASO Groundnut Oil 1L'),
    ('JIRASO Mustard Oil', 'JIRASO Groundnut Oil'),
    ('7899b4', 'c4a860'),
    ('f28388', 'ffc04a'),
    ('Raspberry Ginger', 'Orange Honey'),
    ("Bold, pungent oil perfect for traditional Indian cooking.", "Light, versatile oil for everyday use."),
    ('Meera Singh', 'Sunita Patel'),
    ("reminds me of my grandmother's cooking", 'Great for deep frying, very clean'),
    ('Amit Gupta', 'Ravi Kumar'),
    ('Best quality mustard oil', 'Best groundnut oil available'),
    ('Kavita Reddy', 'Nisha Agarwal'),
    ('Never going back to refined oil', 'My whole family switched to this'),
    ('Suresh Kumar', 'Manoj Tiwari'),
    ('Great purity and taste', 'Very light, healthy choice'),
    ('100% Pure Wood Pressed Mustard Oil', '100% Pure Wood Pressed Groundnut Oil'),
    ('Rich in Omega-3 &amp; Omega-6', 'Rich in Vitamin A &amp; Vitamin E'),
    ('Traditional Kachi Ghani Method', 'Natural Low-Heat Press Method'),
    ('currentPrice = 450', 'currentPrice = 400'),
], [
    ('\u20b9135', '\u20b9120'), ('\u20b9250', '\u20b9225'), ('\u20b9450', '\u20b9400'),
    ('selectSize(this,135)', 'selectSize(this,120)'),
    ('selectSize(this,250)', 'selectSize(this,225)'),
    ('selectSize(this,450)', 'selectSize(this,400)'),
    ('>&#x20B9;450', '>&#x20B9;400'),
], 'product-groundnut.html')
