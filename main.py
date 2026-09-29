"""
=============================================================================
TRACKPULSE — MAIN PYTHON ENTRY POINT
=============================================================================
Run options:
  1. Python Flask Web Application: python app.py
  2. Python Interactive Terminal CLI: python main.py
"""

import sys
import os

# Add root directory to python path
sys.path.insert(0, os.path.dirname(__file__))

from python.main_cli import main_menu

if __name__ == '__main__':
    main_menu()
