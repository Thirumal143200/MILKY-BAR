$runs = @(30758839046, 30758839048, 30758839049)
foreach ($r in $runs) {
    $data = Invoke-RestMethod -Uri "https://api.github.com/repos/Thirumal143200/MILKY-BAR/actions/runs/$r/jobs"
    foreach ($j in $data.jobs) {
        Write-Host "RUN $r | JOB: $($j.name) | STATUS: $($j.status) | CONCLUSION: $($j.conclusion)"
    }
}
