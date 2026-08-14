import importlib.util
from pathlib import Path

module_path = Path(__file__).resolve().parents[1] / 'update_cloudinary_portfolio.py'
spec = importlib.util.spec_from_file_location('update_cloudinary_portfolio', module_path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def test_filter_live_folders_removes_stale_album_names():
    raw_folders = ['images/Dreamcore', 'images/portrait', 'osean']
    resources = [
        {'public_id': 'Dreamcore/cover'},
        {'public_id': 'portrait/1'},
    ]

    result = module.filter_live_folders(raw_folders, resources)

    assert result == ['Dreamcore', 'portrait']


def test_filter_live_folders_is_case_insensitive_and_deduplicates():
    raw_folders = ['images/Portrait']
    resources = [
        {'public_id': 'Portrait/1'},
        {'public_id': 'portrait/2'},
        {'public_id': 'Portrait/1'},
    ]

    result = module.filter_live_folders(raw_folders, resources)

    assert result == ['Portrait']
    assert module.derive_folder_names_from_resources(resources) == ['Portrait']
