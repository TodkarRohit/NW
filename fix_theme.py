import sys

def fix_theme_id(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        code = f.read()
    
    code = code.replace('id="themeToggle"', 'id="themeToggleBtn"')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(code)

fix_theme_id('notes/viewer.html')
fix_theme_id('question_bank/viewer.html')
print('Fixed theme toggle ID')
