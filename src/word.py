from docx import Document
import platform
import subprocess
import os

def word_to_text(path):
    if path.endswith('.docx'):
            doc = Document(path)
            return "\n".join(p.text for p in doc.paragraphs)
    elif path.endswith('.doc'):
        system = platform.system()
        binary_map = {
            "Windows": "bin/antiword-win.exe",
            "Darwin": "bin/antiword-mac",
            "Linux": "bin/antiword-linux"
        }
        
        try:
            binary = binary_map.get(system)
        except:
            raise RuntimeError(f"Missing antiword binary for {system}")

        if system != "Windows":
            os.chmod(binary, 0o755)

        output = subprocess.check_output([binary, path])
        return output.decode("utf-8")