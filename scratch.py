import os
import re

search_dir = r'c:\Users\Rohit Sharma\Desktop\crmos\crmos\src\modules'

pattern = re.compile(r'<div className="flex justify-between items-(center|end)">')
replacement = r'<div className="flex flex-col sm:flex-row justify-between items-start sm:items-\1 gap-4">'

count = 0
for root, dirs, files in os.walk(search_dir):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            matches = len(pattern.findall(content))
            if matches > 0:
                new_content = pattern.sub(replacement, content)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Fixed {matches} occurrences in {file}')
                count += 1

print(f'Total files modified: {count}')
