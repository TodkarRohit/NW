import os

assign_file = 'assignments/assignments.js'
with open(assign_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if 'adminToggleBtn.addEventListener' in line:
        skip = True
        continue
    if skip and '});' in line:
        skip = False
        continue
    if skip:
        continue
        
    if 'window.location.href' in line and 'admin/index.html' in line:
        new_lines.append(line.replace("window.location.href = '../admin/index.html';", "if (document.getElementById('adminToggleBtn')) document.getElementById('adminToggleBtn').click();"))
        new_lines[-1] = new_lines[-1].replace("window.location.href = \\'../admin/index.html\\';", "if (document.getElementById('adminToggleBtn')) document.getElementById('adminToggleBtn').click();")
    else:
        new_lines.append(line)

with open(assign_file, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print('Fixed assignments.js redirects and listeners')
