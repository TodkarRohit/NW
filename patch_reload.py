import sys

def patch_file(filepath, search_str, replace_str):
    with open(filepath, 'r', encoding='utf-8') as f:
        code = f.read()
    
    if replace_str not in code:
        code = code.replace(search_str, replace_str)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"Patched {filepath}")
    else:
        print(f"Already patched {filepath}")

patch_file(
    'assets/auth-modal.js', 
    'showToast(`Welcome back, ${userVal}!`);',
    'showToast(`Welcome back, ${userVal}!`);\n                        setTimeout(() => window.location.reload(), 1000);'
)

patch_file(
    'assets/auth-modal.js', 
    "showToast('Logged in as Admin (Local Mode).');",
    "showToast('Logged in as Admin (Local Mode).');\n                            setTimeout(() => window.location.reload(), 1000);"
)

patch_file(
    'assets/auth.js',
    "this.showToast('You have been logged out successfully.');",
    "this.showToast('You have been logged out successfully.');\n            setTimeout(() => window.location.reload(), 1000);"
)
