from plone.app.registry.browser.controlpanel import ControlPanelFormWrapper
from plone.app.registry.browser.controlpanel import RegistryEditForm
from plone.base.interfaces import IPloneSiteRoot
from plone.restapi.controlpanels import RegistryConfigletPanel
from sc.eprocessos import _
from sc.eprocessos.interfaces import IBrowserLayer
from sc.eprocessos.interfaces import IEProcessosSettings
from zope.component import adapter


class EProcessosSettingsEditForm(RegistryEditForm):
    schema = IEProcessosSettings
    label = _("e-Processos Settings")
    schema_prefix = "eprocessos"

    def updateFields(self):
        super().updateFields()

    def updateWidgets(self):
        super().updateWidgets()


class EProcessosSettingsControlPanel(ControlPanelFormWrapper):
    form = EProcessosSettingsEditForm


@adapter(IPloneSiteRoot, IBrowserLayer)
class EProcessosSettingsConfigletPanel(RegistryConfigletPanel):
    """Control Panel endpoint"""

    schema = IEProcessosSettings
    title = _("e-Processos Settings")
    configlet_id = "eprocessos-settings"
    configlet_category_id = "Products"
    group = "Products"
    schema_prefix = "eprocessos"
