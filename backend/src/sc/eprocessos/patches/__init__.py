def apply_patches():
    """Apply all patches."""
    from .copy_support import patch__verifyObjectPaste

    patch__verifyObjectPaste()
