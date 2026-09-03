import sys

# 1. Update assets/auth.js
with open('assets/auth.js', 'r', encoding='utf-8') as f:
    auth_code = f.read()

# Update saveSession in auth.js
old_save_session = '''        saveSession(token, user) {
            if (token) localStorage.setItem(TOKEN_KEY, token);
            if (user) {
                localStorage.setItem(USER_KEY, JSON.stringify(user));
                // Set legacy flag for existing admin compatibility
                if (user.username === 'admin' || user.email === 'rohittodkar92@gmail.com' || user.username === 'rohittodkar92@gmail.com') {
                    localStorage.setItem('isAdminMode', 'true');
                }
            }
            this.updateHeaderUI();
        },'''

new_save_session = '''        saveSession(token, user) {
            if (token) localStorage.setItem(TOKEN_KEY, token);
            if (user) {
                localStorage.setItem(USER_KEY, JSON.stringify(user));
                const isAdmin = 
                    user.is_admin === true || 
                    user.is_admin === 'true' || 
                    user.role === 'admin' || 
                    String(user.role || '').toLowerCase() === 'admin' ||
                    user.username === 'admin' || 
                    user.email === 'rohittodkar92@gmail.com' || 
                    user.username === 'rohittodkar92@gmail.com';

                if (isAdmin) {
                    localStorage.setItem('isAdminMode', 'true');
                } else {
                    localStorage.setItem('isAdminMode', 'false');
                }
            }
            this.updateHeaderUI();
        },'''

auth_code = auth_code.replace(old_save_session, new_save_session)

# Update login in auth.js to pass full user object (including is_admin/role) to saveSession
old_login_end = '''            const newCount = (data[0].login_count || 0) + 1;
            await window.supabaseClient
                .from('users')
                .update({ login_count: newCount, last_login_at: new Date().toISOString() })
                .or(`username.eq.${cleanUser},email.eq.${cleanUser}`);

            this.saveSession('custom_token_' + cleanUser, { username: cleanUser });

            return { user: { username: cleanUser } };'''

new_login_end = '''            const dbUser = data[0];
            const newCount = (dbUser.login_count || 0) + 1;
            await window.supabaseClient
                .from('users')
                .update({ login_count: newCount, last_login_at: new Date().toISOString() })
                .or(`username.eq.${cleanUser},email.eq.${cleanUser}`);

            this.saveSession('custom_token_' + (dbUser.username || cleanUser), dbUser);

            return { user: dbUser };'''

auth_code = auth_code.replace(old_login_end, new_login_end)

with open('assets/auth.js', 'w', encoding='utf-8') as f:
    f.write(auth_code)
print("Updated assets/auth.js")

# 2. Update assignments/assignments.js
with open('assignments/assignments.js', 'r', encoding='utf-8') as f:
    ass_code = f.read()

old_check_admin = '''    function checkIsAdmin() {
        if (window.authService && window.authService.isLoggedIn()) {
            return true;
        }
        return localStorage.getItem('isAdminMode') === 'true';
    }'''

new_check_admin = '''    function checkIsAdmin() {
        return localStorage.getItem('isAdminMode') === 'true';
    }'''

ass_code = ass_code.replace(old_check_admin, new_check_admin)
ass_code = ass_code.replace('isAdminMode = true;\n                    updateAdminUI();', 'isAdminMode = checkIsAdmin();\n                    updateAdminUI();')

with open('assignments/assignments.js', 'w', encoding='utf-8') as f:
    f.write(ass_code)
print("Updated assignments/assignments.js")
