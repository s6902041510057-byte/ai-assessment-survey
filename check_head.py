import subprocess
r = subprocess.run(["git", "show", "HEAD:src/data/survey.ts"], capture_output=True, text=True, cwd=r"D:\Assessment Form")
s = r.stdout
print("questions:", s.count('id: "q'))
print("dropdown:", s.count('type: "dropdown"'))
print("feelings section:", "feelings" in s)
print("logo in HEAD:", "logo.png" in subprocess.run(["git","ls-tree","-r","HEAD","--name-only"],capture_output=True,text=True,cwd=r"D:\Assessment Form").stdout)
PYEOF