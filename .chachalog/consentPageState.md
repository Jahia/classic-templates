---
# Allowed version bumps: patch, minor, major
classic-templates: patch
---

After Accept or Refuse in the consent banner, the page's copy of jExperience's tracking switch (`digitalData.wemInitConfig.activateWem`) now follows the choice at once. It kept its page-load value until the next page, so a visitor who accepted on a page holding a Formidable form mapped to the jExperience profile sent the form without its answers reaching the profile.
