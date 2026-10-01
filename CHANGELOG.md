# Changelog

All notable changes to classic-travel are listed here, newest first.

## 0.1.0 (unreleased)

First version, a companion of the classic-templates template set.

- Destination (`ctrv:destination`): city, airport code, country, region, teaser, description,
  image, "from" price with its note, key facts (currency, language, time zone, electricity,
  dialling code) and related destinations. Full page, card and compact views.
- Fare offer (`ctrv:fareOffer`): destination, departure city, cabin, price, travel period, end of
  sale, conditions and a call to action. Full page, card and compact views; the page shows when the
  sale has ended.
- Fare list (`ctrv:fareList`): fare offers under a folder, filtered by the region of their
  destination, sorted by price, end of sale or destination, offers whose sale has ended left out.
- Destination grid (`ctrv:destinationGrid`): destinations under a folder, filtered by region, from
  A to Z, with their "from" price.
- Travel tools (`ctrv:travelTools`, `ctrv:travelTool`): tools shown as accessible tabs (stacked
  sections without JavaScript and in edit mode) with a contributed notice.
- Destinations and fare offers are listable by the classic-templates content list
  (`ctplmix:listable`), and every section can be placed in classic-templates page areas, columns and
  free zones.
- Prices written for the eye with the currency code and for screen readers with the currency name;
  dates in the page's language.
- schema.org JSON-LD for destination pages (`TouristDestination`) and offer pages (`Offer`), next
  to the page graph of classic-templates.
- EN and FR editor labels, tooltips and visitor texts.
