import sys

with open('assets/auth-modal.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. unhide email
code = code.replace(
    '<div class="form-group custom-form-group" id="emailFormGroup" style="display:none;">',
    '<div class="form-group custom-form-group" id="emailFormGroup">'
)

# 2. unhide email on login
code = code.replace(
    "if (emailFormGroup) emailFormGroup.style.display = 'none';",
    "// email visible on login"
)

# 3. remove required from username and update placeholder
code = code.replace(
    'id="adminUsernameInput" placeholder="Enter username" required autocomplete="username"',
    'id="adminUsernameInput" placeholder="Enter username or email" autocomplete="username"'
)

# 4. update validation
orig_val = '''                    if (userVal.includes('@') || userVal.includes(' ')) {
                        throw new Error('Username must not contain @ or spaces. Please enter a simple handle.');
                    }
                    if (!emailVal) {
                        throw new Error('Please enter your email address.');
                    }'''
new_val = '''                    const loginId = userVal || emailVal;
                    if (!loginId) {
                        throw new Error('Please enter either your username or email address.');
                    }
                    if (userVal && (userVal.includes('@') || userVal.includes(' '))) {
                        throw new Error('Username must not contain @ or spaces. Please enter a simple handle.');
                    }'''
code = code.replace(orig_val, new_val)

# 5. update login method call
code = code.replace(
    'await window.authService.login(userVal, passVal);',
    'const loginId = userVal || emailVal; await window.authService.login(loginId, passVal);'
)

# 6. update fallback logic
orig_off = "if ((userVal === 'admin' && passVal === 'admin123') || (userVal === 'admin' && passVal === 'admin') || (userVal === 'rohittodkar92@gmail.com' && passVal === 'Admin@123')) {"
new_off = "const loginId2 = userVal || emailVal; if ((loginId2 === 'admin' && passVal === 'admin123') || (loginId2 === 'admin' && passVal === 'admin') || (loginId2 === 'rohittodkar92@gmail.com' && passVal === 'Admin@123')) {"
code = code.replace(orig_off, new_off)

with open('assets/auth-modal.js', 'w', encoding='utf-8') as f:
    f.write(code)
print("Done")
