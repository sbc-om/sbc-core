# Bitcoin Market 1.0.4

- Replaced the abandoned TradingView path with the in-house Binance-backed chart as the only active chart implementation.
- Added upgrade-aware marketplace cards so installed modules show `Update` when a newer uploaded version exists.
- Fixed module actions to use current database state when installing, updating, or uninstalling modules.
- Restricted runtime external-module discovery to uploaded packages under `apps/console/external-modules`.
- Prevented kernel bootstrap from auto-upgrading installed modules as a startup side effect.
- Removed duplicate marketplace rendering for installed external modules.
- Validated the full upload and update flow from `1.0.3` to `1.0.4` in the console UI.