import sys
import os

# Add your project directory to the sys.path
project_home = '/home/yourusername/hackathon-voting'
if project_home not in sys.path:
    sys.path = [project_home] + sys.path

# Set the working directory
os.chdir(project_home)

# Import Flask app
from app import app as application
