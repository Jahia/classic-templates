---
# Allowed version bumps: patch, minor, major
classic-templates: minor
---

Traditional Chinese pages (`zh_HK`, `zh_TW`, `zh_MO`) show the template set's built-in labels (skip link, menu, search, sign-in, reading time, breadcrumb, edit-mode notes...) in Traditional characters: "閱讀時間 1 分鐘" where they read "阅读时间 1 分钟". Jahia's JavaScript engine reads one label file per language and ignores the region, so those pages got the Simplified labels of `zh.json`; the file now also holds a Traditional set (under `zh-Hant`) that the views pick from the page's locale. `zh_CN` and `zh` pages are unchanged.

The language switcher is a drop-down: a button with a globe and the current language opens the list of the page's languages, each under its own name (English, Français, 繁體中文, 简体中文) instead of its code (EN, ZH-HK, ZH-CN), which did not tell the two Chinese versions apart for most readers. Two languages that would read the same (`en_GB` and `en_US`) also show their country. It opens without JavaScript, closes on Escape, a click elsewhere or focus leaving, and takes each theme's colours, corners and shadow in light and dark mode.
