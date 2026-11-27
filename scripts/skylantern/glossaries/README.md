# Skylantern glossary

`skylantern-aviation.csv` is the translation glossary of the `skylantern` site for the
[ai-assisted-translations](https://github.com/Jahia/ai-assisted-translations) module (glossaries
since 2.0.0; checked against the 2.0.3 parser). 108 rows: brand and partner names, fare brands,
aircraft and airport codes kept as they are, the spelling of the destinations used in Hong Kong,
and the airline vocabulary of the site (cabins, booking, check-in, baggage, operations, on board,
assistance) in English, French and Hong Kong Traditional Chinese (the site's Chinese language code is `zh`).

## Installing

Upload the file to the site's media under `files/glossaries/` (the module reads every `.csv` in
`/sites/skylantern/files/glossaries`, the `translation.glossary.relative.path` setting). It is used
by the next translation; no restart.

## Format rules this file follows

- UTF-8, comma separated, first column `key`, then one column per **site language code exactly**:
  `en`, `fr`, `zh`. The module looks a column up by the language of the content, so a `zh_HK` or
  `fr_FR` column is never used on a site whose languages are `zh` and `fr` (a `zh_HK` column made
  the first upload apply no Chinese term at all).
- `domain` only groups the rows for people; the module ignores every column that is not a language.
  There is no `status` column on purpose: 2.0.3 ignores it too, so an "inactive" row would still apply.
- Sources match case-sensitively with DeepL, so the terms the site uses in headings have a
  capitalised row as well (`check-in` and `Check-in`).
- No leading or trailing space, no non-breaking space, no duplicate source per language pair: with
  DeepL, one invalid entry makes DeepL refuse the whole glossary and translations run without it,
  with only a line in the server log (fixed by Jahia/ai-assisted-translations#24, not released yet).
- Written for English as the source language. Translating from `zh`, some Chinese terms have two
  English sources (`check-in`, `Check-in`) and the module keeps one of them.

## To check before relying on it

- The `zh` terms follow Hong Kong usage (寄艙行李, 登機閘口, 離港 and 抵港, 充電寶, 八號烈風或暴風信號
  for the official signal name) but have not been reviewed by a native speaker.
- Whether DeepL accepts a glossary for Traditional Chinese (`ZH-HANT`) is untested here; if it does
  not, the module translates without the glossary and only logs it.
