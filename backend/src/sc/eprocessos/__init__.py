"""Init and utils."""

from zope.i18nmessageid import MessageFactory

import logging


__version__ = "1.0.0a0"

PACKAGE_NAME = "sc.eprocessos"

_ = MessageFactory(PACKAGE_NAME)

logger = logging.getLogger(PACKAGE_NAME)

# Silence httpx/httpcore — they log every request at INFO level, which floods
# the Zope event log when the client is making frequent e-Processos calls.
# Operators can bump these back to DEBUG via Zope's logging config if needed.
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)
