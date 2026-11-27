"""Runs core/tts/tts_zh.py with edge-tts routed through the session's HTTPS proxy (no edits to core/)."""
import os, sys, runpy, edge_tts
_init = edge_tts.Communicate.__init__
def init(self, *a, **k):
    k.setdefault('proxy', os.environ.get('HTTPS_PROXY'))
    _init(self, *a, **k)
edge_tts.Communicate.__init__ = init
lib = os.environ['LIB']
sys.argv = [os.path.join(lib, 'core/tts/tts_zh.py')] + sys.argv[1:]
runpy.run_path(sys.argv[0], run_name='__main__')
