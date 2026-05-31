# Stop hook: warns once if structural source files changed in this session without
# ARCHITECTURE.md / CLAUDE.md also being touched. Loop-safe via stop_hook_active.
# Exit 2 surfaces the stderr message back to the model; exit 0 is silent.

$ErrorActionPreference = 'SilentlyContinue'

# Read the hook payload; bail (silently) if we're already in a stop-hook continuation.
$raw = [Console]::In.ReadToEnd()
try { $in = $raw | ConvertFrom-Json } catch { $in = $null }
if ($in -and $in.stop_hook_active) { exit 0 }

# Files changed since upstream (unpushed commits) + uncommitted, deduped.
$upstream = git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>$null
$range = if ($upstream) { "$upstream...HEAD" } else { 'HEAD~3...HEAD' }
$files = @()
$files += git diff --name-only $range 2>$null
$files += git diff --name-only HEAD 2>$null
$files += git diff --name-only --cached 2>$null
$files = $files | Where-Object { $_ } | Sort-Object -Unique
if (-not $files) { exit 0 }

# High-signal structural files: a change here usually needs a doc update.
$triggerPattern = 'src/store/useWorksheetStore\.tsx$|src/config/(exerciseRegistry|exerciseUI|appstructure|baseSettings|exerciseCatalog)\.|src/services/persistence\.ts$'
$trigger = $files | Where-Object { $_ -match $triggerPattern }
$docs = $files | Where-Object { $_ -match '^(ARCHITECTURE|CLAUDE)\.md$' }

if ($trigger -and -not $docs) {
    $list = ($trigger | ForEach-Object { "  - $_" }) -join "`n"
    [Console]::Error.WriteLine("Doc-sync check: structural files changed without updating ARCHITECTURE.md / CLAUDE.md:`n$list`nUpdate the docs (state table / registry table / file map / §13) per the doc-sync rule in CLAUDE.md, or confirm no doc change is needed, then stop.")
    exit 2
}
exit 0
