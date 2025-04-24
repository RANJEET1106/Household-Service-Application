import os

from flask import current_app

def get_next_filename(prefix, folder):
    """ Generate the next filename based on the prefix and existing files in the folder. """
    existing_files = os.listdir(folder)
    numbers = [
        int(f.split('_')[1].split('.')[0]) for f in existing_files if f.startswith(prefix)
    ]
    print(numbers)
    next_num = max(numbers) + 1 if numbers else 1
    return f"{prefix}_{next_num}"

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def delete_file(file_path):
    """Delete file if it exists"""
    if file_path:
        full_path = os.path.join(current_app.root_path, file_path)
        if os.path.exists(full_path):
            os.remove(full_path)
