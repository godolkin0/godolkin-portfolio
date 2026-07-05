# Generates the branded raster assets in /public (og.png, favicon-32.png,
# apple-touch-icon.png) using System.Drawing, so no npm dependency is needed.
# Windows-only utility; rerun after changing the brand look:
#   powershell -ExecutionPolicy Bypass -File scripts/generate-assets.ps1

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$pub = Join-Path $root "public"
New-Item -ItemType Directory -Force $pub | Out-Null

# Site palette (matches src/index.css @theme)
$ink    = [System.Drawing.Color]::FromArgb(255, 10, 15, 22)    # --color-ink
$panel  = [System.Drawing.Color]::FromArgb(255, 15, 22, 33)    # --color-panel
$fg     = [System.Drawing.Color]::FromArgb(255, 219, 228, 238) # --color-fg
$dim    = [System.Drawing.Color]::FromArgb(255, 139, 152, 169) # --color-dim
$accent = [System.Drawing.Color]::FromArgb(255, 52, 211, 153)  # --color-accent
$cyan   = [System.Drawing.Color]::FromArgb(255, 34, 211, 238)  # --color-accent-2

function New-RoundedRectPath([float]$x, [float]$y, [float]$w, [float]$h, [float]$r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Draw-Glow($g, [float]$cx, [float]$cy, [float]$r, [System.Drawing.Color]$color) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddEllipse($cx - $r, $cy - $r, 2 * $r, 2 * $r)
  $brush = New-Object System.Drawing.Drawing2D.PathGradientBrush($path)
  $brush.CenterColor = $color
  $brush.SurroundColors = @([System.Drawing.Color]::FromArgb(0, $color.R, $color.G, $color.B))
  $g.FillEllipse($brush, $cx - $r, $cy - $r, 2 * $r, 2 * $r)
  $brush.Dispose(); $path.Dispose()
}

# ---------- og.png (1200x630) ----------
$bmp = New-Object System.Drawing.Bitmap(1200, 630)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear($ink)

# faint grid, same 56px rhythm as the site backdrop
$gridPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(8, 255, 255, 255), 1)
for ($x = 0; $x -le 1200; $x += 56) { $g.DrawLine($gridPen, $x, 0, $x, 630) }
for ($y = 0; $y -le 630; $y += 56) { $g.DrawLine($gridPen, 0, $y, 1200, $y) }
$gridPen.Dispose()

# soft green / cyan glows
Draw-Glow $g 240 100 340 ([System.Drawing.Color]::FromArgb(42, $accent.R, $accent.G, $accent.B))
Draw-Glow $g 1020 470 360 ([System.Drawing.Color]::FromArgb(36, $cyan.R, $cyan.G, $cyan.B))

$fgBrush = New-Object System.Drawing.SolidBrush($fg)
$dimBrush = New-Object System.Drawing.SolidBrush($dim)
$accentBrush = New-Object System.Drawing.SolidBrush($accent)

# wordmark: GODOLKIN_ (underscore in accent green)
$mono = New-Object System.Drawing.Font("Consolas", 36, [System.Drawing.FontStyle]::Bold)
$wm = "GODOLKIN"
$wmSize = $g.MeasureString($wm, $mono)
$g.DrawString($wm, $mono, $fgBrush, 68, 66)
$g.DrawString("_", $mono, $accentBrush, 68 + $wmSize.Width - 14, 66)

# tagline, two lines; second line gets the green-to-cyan gradient
$big = New-Object System.Drawing.Font("Segoe UI", 46, [System.Drawing.FontStyle]::Bold)
$g.DrawString("Automation that actually ships.", $big, $fgBrush, 60, 210)
$line2 = "See it work before you hire me."
$line2Size = $g.MeasureString($line2, $big)
$line2Rect = New-Object System.Drawing.RectangleF(60, 296, $line2Size.Width, $line2Size.Height)
$gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($line2Rect, $accent, $cyan, 0.0)
$g.DrawString($line2, $big, $gradBrush, 60, 296)
$gradBrush.Dispose()

# supporting lines + email ([char]0xB7 = middot, avoids ANSI/UTF-8 mojibake)
$mid = [string][char]0x00B7
$small = New-Object System.Drawing.Font("Segoe UI", 20)
$g.DrawString("Real automations running live in your browser:", $small, $dimBrush, 66, 428)
$g.DrawString(("lead triage $mid client reports $mid a trading signal bot"), $small, $dimBrush, 66, 470)
$monoSmall = New-Object System.Drawing.Font("Consolas", 20, [System.Drawing.FontStyle]::Bold)
$g.DrawString("godolkin0@gmail.com", $monoSmall, $accentBrush, 66, 548)
$enIt = "EN $mid IT"
$enItSize = $g.MeasureString($enIt, $monoSmall)
$g.DrawString($enIt, $monoSmall, $dimBrush, 1140 - $enItSize.Width, 548)

$bmp.Save((Join-Path $pub "og.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
$mono.Dispose(); $big.Dispose(); $small.Dispose(); $monoSmall.Dispose()

# ---------- favicons (G_ mark on rounded dark tile) ----------
function New-Favicon([int]$size, [string]$outName, [float]$radius, [float]$fontSize) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $tile = New-RoundedRectPath 0 0 $size $size $radius
  $bg = New-Object System.Drawing.SolidBrush($panel)
  $g.FillPath($bg, $tile)
  $bg.Dispose(); $tile.Dispose()

  $font = New-Object System.Drawing.Font("Consolas", $fontSize, [System.Drawing.FontStyle]::Bold)
  $fgB = New-Object System.Drawing.SolidBrush($fg)
  $acB = New-Object System.Drawing.SolidBrush($accent)

  $whole = $g.MeasureString("G_", $font)
  $gOnly = $g.MeasureString("G", $font)
  $x = ($size - $whole.Width) / 2 + 1
  $y = ($size - $whole.Height) / 2 - ($size * 0.02)
  $g.DrawString("G", $font, $fgB, $x, $y)
  $g.DrawString("_", $font, $acB, $x + $gOnly.Width - ($fontSize * 0.45), $y)

  $bmp.Save((Join-Path $pub $outName), [System.Drawing.Imaging.ImageFormat]::Png)
  $font.Dispose(); $fgB.Dispose(); $acB.Dispose(); $g.Dispose(); $bmp.Dispose()
}

New-Favicon 32 "favicon-32.png" 7 15
New-Favicon 180 "apple-touch-icon.png" 40 84

# verify what we wrote
foreach ($name in @("og.png", "favicon-32.png", "apple-touch-icon.png")) {
  $img = [System.Drawing.Image]::FromFile((Join-Path $pub $name))
  Write-Output ("{0}: {1}x{2}" -f $name, $img.Width, $img.Height)
  $img.Dispose()
}
