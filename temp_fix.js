const fs = require('fs');
let code = fs.readFileSync('assets/auth-modal.js', 'utf8');

// 1. Unhide email group
code = code.replace(
    '<div class="form-group custom-form-group" id="emailFormGroup" style="display:none;">',
    '<div class="form-group custom-form-group" id="emailFormGroup">'
);

// 2. Unhide on login mode
code = code.replace(
    "if (emailFormGroup) emailFormGroup.style.display = 'none';",
    "// email visible on login"
);

// 3. Remove required from username
code = code.replace(
    'id="adminUsernameInput" placeholder="Enter username" required autocomplete="username"',
    'id="adminUsernameInput" placeholder="Enter username or email" autocomplete="username"'
);

// 4. Also update placeholder for email just in case
code = code.replace(
    'placeholder="Email Address"',
    'placeholder="Email Address"'
);

// 5. Update validation
let originalValidation =                     if (userVal.includes('@') || userVal.includes(' ')) {
                        throw new Error('Username must not contain @ or spaces. Please enter a simple handle.');
                    }
                    if (!emailVal) {
                        throw new Error('Please enter your email address.');
                    };

let newValidation =                     const loginId = userVal || emailVal;
                    if (!loginId) {
                        throw new Error('Please enter either your username or email address.');
                    }
                    if (userVal && (userVal.includes('@') || userVal.includes(' '))) {
                        throw new Error('Username must not contain @ or spaces. Please enter a simple handle.');
                    };

code = code.replace(originalValidation, newValidation);

// 6. Update login call
code = code.replace(
    "await window.authService.login(userVal, passVal);",
    "const loginId = userVal || emailVal; await window.authService.login(loginId, passVal);"
);

// 7. Update fallback offline
let offlineOrig = "if ((userVal === 'admin' && passVal === 'admin123') || (userVal === 'admin' && passVal === 'admin') || (userVal === 'rohittodkar92@gmail.com' && passVal === 'Admin@123')) {";
let offlineNew = "const loginId2 = userVal || emailVal; if ((loginId2 === 'admin' && passVal === 'admin123') || (loginId2 === 'admin' && passVal === 'admin') || (loginId2 === 'rohittodkar92@gmail.com' && passVal === 'Admin@123')) {";
code = code.replace(offlineOrig, offlineNew);

fs.writeFileSync('assets/auth-modal.js', code);
