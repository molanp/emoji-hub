Get-ChildItem -Include *.png, *.gif -Recurse | ForEach-Object {
    $dest = Join-Path $_.DirectoryName ($_.BaseName + ".webp")
    
    ffmpeg -y -hide_banner -loglevel error -i $_.FullName -lossless 1 -loop 0 $dest
    
    # 检查 FFmpeg 的退出码 ($?)
    if ($?) {
        Remove-Item $_.FullName
        Write-Host "[成功] " -NoNewline -ForegroundColor Green
        Write-Host "已转换并删除原图: $($_.Name) -> $($_.BaseName).webp"
    } else {
        Write-Host "[失败] " -NoNewline -ForegroundColor Red
        Write-Host "转换出错，已保留原图: $($_.Name)"
    }
}