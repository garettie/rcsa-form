import re

with open('rcsa-data-entry.html', 'r') as f:
    text = f.read()

# I'll just write the app manually, it's safer and guarantees no hallucination or bad regex.
