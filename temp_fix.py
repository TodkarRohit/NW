import os

def fix_viewer_js(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    target = """                <div class="upload-dropzone" style="cursor: pointer; background: var(--bg-surface); border-style: dashed; padding: 20px;">
                    <h3 style="color: var(--text-main); margin-bottom: 10px;"><i class="fa-regular fa-file-pdf" style="color: #ef4444;"></i> Unit 1 Full Notes.pdf</h3>
                    <p style="color: var(--text-light);">Click to view or download</p>
                </div>
                    <h3 style="color: var(--text-muted);">Admin Upload Only</h3>
                    <p style="color: var(--text-light);">Only authenticated admins can upload study materials here.</p>
                </div>"""

    replacement = """                <div class="upload-dropzone" style="cursor: pointer; background: var(--bg-surface); border-style: dashed; padding: 20px;">
                    <h3 style="color: var(--text-main); margin-bottom: 10px;"><i class="fa-regular fa-file-pdf" style="color: #ef4444;"></i> Unit 1 Full Notes.pdf</h3>
                    <p style="color: var(--text-light);">Click to view or download</p>
                    <h3 style="color: var(--text-muted); margin-top: 15px;">Admin Upload Only</h3>
                    <p style="color: var(--text-light);">Only authenticated admins can upload study materials here.</p>
                </div>"""

    content = content.replace(target, replacement)
    
    # Let's also fix the theme toggle logic in viewer.js to apply data-theme to documentElement
    theme_target = """            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');"""
    theme_replacement = """            document.body.setAttribute('data-theme', 'dark');
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');"""
    content = content.replace(theme_target, theme_replacement)
    
    theme_light_target = """            document.body.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');"""
    theme_light_replacement = """            document.body.removeAttribute('data-theme');
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');"""
    content = content.replace(theme_light_target, theme_light_replacement)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_viewer_js('notes/viewer.js')
fix_viewer_js('question_bank/viewer.js')

css_append = """

/* Dark mode overwrites for viewer.css */
[data-theme="dark"] {
    --bg-page: #0b1329;
    --bg-surface: #1e293b;
    --border-color: #334155;
    --border-subtle: #475569;
    --text-main: #f8fafc;
    --text-muted: #94a3b8;
    --text-heading: #e2e8f0;
    --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
"""

def append_css(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'a', encoding='utf-8') as f:
        f.write(css_append)

append_css('notes/viewer.css')
append_css('question_bank/viewer.css')

print("Fixes applied successfully!")
