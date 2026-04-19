import subprocess, os, sys
os.chdir(r'C:\Users\Micha\claude-projects\legal-saas\apps\web')
os.environ['PATH'] = r'C:\Program Files\nodejs' + os.pathsep + os.environ.get('PATH', '')
proc = subprocess.Popen(
    [r'C:\Program Files\nodejs\npx.cmd', 'next', 'dev', '--port', '3000'],
    stdout=sys.stdout, stderr=sys.stderr
)
proc.wait()
