---
# Allowed version bumps: patch, minor, major
classic-templates: patch
---

The release checklist says the demo replication kit leaves every running development build (SNAPSHOT) in place, whatever its version, so a release never replaces the demo instance's build from a demo branch; it also says that the release commit's integration tests fail by design (the test provisioning installs development builds only) and that the next development version's run is the check
