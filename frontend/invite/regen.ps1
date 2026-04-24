Set-Location $PSScriptRoot

$template  = Get-Content "proplus-forrester-invite.html" -Raw -Encoding UTF8
$logosDir  = "company name_first name\logos"
$outputDir = "invites"

New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

Get-ChildItem "$logosDir\*.png" | ForEach-Object {
    $basename = $_.BaseName

    if ($basename -match '^(.+)_([^_]+)$') {
        $companyName = $Matches[1].Trim()
        $personName  = $Matches[2].Trim()
    } else {
        $companyName = $basename
        $personName  = $basename
    }

    $logoFile    = $_.Name
    $safeCompany = ($companyName -replace '[^a-zA-Z0-9 ]', '' -replace ' ', '-').ToLower()
    $outFile     = "$outputDir\$safeCompany.html"

    $html = $template `
        -replace '\{\{COMPANY_LOGO\}\}', $logoFile `
        -replace '\{\{COMPANY_NAME\}\}', $companyName `
        -replace '\{\{PERSON_NAME\}\}',  $personName

    [System.IO.File]::WriteAllText(
        [System.IO.Path]::Combine($PSScriptRoot, $outFile),
        $html,
        [System.Text.Encoding]::UTF8
    )
    Write-Host "OK: $outFile | $companyName | $personName"
}

Write-Host "Done."
