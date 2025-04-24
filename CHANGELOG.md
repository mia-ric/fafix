FaFiX - Changelog
=================

## Version 0.3.0 (Beta)
- Add: Favicon and Title indicator displaying counts for alerts and new messages.
- Add: Different indicator-color on the statistics when any event-counter decreases.
- Fix: Title changes incorrectly inserted a new books/statistic entry.
- Fix: Resolved issue where `npm run serve` did not correctly provide the CSS stylesheet.
- Fix: Issue in TipTap Editor where a space was incorrectly added before paragraphs in certain cases.
- Fix: Corrected parsing of nested tags in TipTap Editor (using HTML instead of JSON structure).

## Version 0.2.3 (Beta)
- Fix: Missing if-condition on statistics vue component.

## Version 0.2.2 (Beta)
- Fix: Weird style-issue on Firefox-based browsers.

## Version 0.2.1 (Beta)
- Fix: Incorrect width in the statistics note overlay and button.

## Version 0.2.0 (Beta)
- Add: Check for the latest installed version of FAFIX (show alert if new message is available).
- Add: New overlay button for configuration access and version indication.
- Add: Additional help text and usage hints for charts.
- Add: New import, export, and reset features (available via the new overlay modal).
- Add: New summary statistics view showing daily changes compared to the previous day.
- Update: Charts now use dots as thousand separators for better readability.
- Update: A few minor changes and fixes.

## Version 0.1.4 (Alpha)
- Fix: Statistics section now correctly placed below the horizontal divider again.
- Fix: Removed floating point values from the y-axis labels on the chart.

## Version 0.1.3 (Alpha)
- Add: Added updater for books and statistics data.
- Add: Implemented login state check for the user.

## Version 0.1.2 (Alpha)
- Add: Introduced an additional `books` table.
- Add: New handler and composable for local/session storage.
- Update: Refactored database tables to use composables.
- Update: Minor adjustments and quality-of-code improvements.
- Fix: Corrected various issues in ApexCharts options and series.
- Fix: Resolved incorrect number of visible tabs in the statistics chart.

## Version 0.1.1 (Alpha)
- Fix: Use specific event-type icons in the annotation image.

## Version 0.1.0 (Alpha)
- Initial Release
