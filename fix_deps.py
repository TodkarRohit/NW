import sys

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        code = f.read()
    
    # 1. Inject styles.css in <head> if not exists
    if '../assets/styles.css' not in code:
        code = code.replace(
            '</head>',
            '    <link rel="stylesheet" href="../assets/styles.css">\n</head>'
        )

    # 2. Inject supabase and auth.js before auth-modal.js
    if '../assets/auth.js' not in code:
        old_script = '<script src="../assets/auth-modal.js"></script>'
        new_scripts = '''<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="../assets/auth.js"></script>
    <script src="../assets/auth-modal.js"></script>'''
        code = code.replace(old_script, new_scripts)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(code)

fix_file('notes/viewer.html')
fix_file('question_bank/viewer.html')
print('Done injecting dependencies')
