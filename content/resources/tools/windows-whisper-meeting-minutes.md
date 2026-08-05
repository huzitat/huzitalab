---
title: "Meeting Minutes with Whisper and ChatGPT on Windows"
description: "A technical note on transcribing MP3 meeting recordings with Whisper and organizing them into meeting minutes with ChatGPT."
date: 2026-08-05
showTitle: true
showDate: false
showReadingTime: false
showWordCount: false
showTaxonomies: false
showAuthorsBadges: false
---

This page describes how to transcribe an MP3 meeting recording with
OpenAI Whisper on Windows and organize the transcription into meeting
minutes with ChatGPT.

FFmpeg is required because Whisper uses it internally to read audio
files. The MP3 file does not need to be converted or divided manually.

## Workflow

```text
MP3 meeting recording
        ↓
Whisper reads the MP3 using FFmpeg
        ↓
Text transcription
        ↓
ChatGPT organizes the transcription
        ↓
Manual review and correction
```

## Requirements

- Windows
- Python 3
- FFmpeg
- OpenAI Whisper
- ChatGPT

## Install FFmpeg

Whisper requires the FFmpeg command-line tool to read MP3 and other
audio files.

Using Chocolatey:

```powershell
choco install ffmpeg
```

Alternatively, using Scoop:

```powershell
scoop install ffmpeg
```

After installation, close and reopen PowerShell. Confirm that FFmpeg is
available:

```powershell
ffmpeg -version
```

In this workflow, FFmpeg is not used directly to convert or divide the
MP3 file. Whisper calls FFmpeg internally when loading the recording.

## Install OpenAI Whisper

Install Whisper using pip:

```powershell
py -m pip install -U openai-whisper
```

Confirm that the `whisper` command is available:

```powershell
whisper --help
```

## Move to the Recording Folder

Open PowerShell and move to the folder containing the MP3 recording.

For example:

```powershell
cd "C:\Users\username\Documents\meeting"
```

Replace the path with the actual location of the recording.

## Transcribe the MP3 File

Run Whisper with the MP3 file as its input:

```powershell
whisper "meeting.mp3" --language Japanese --model medium --output_format txt --fp16 False
```

The options have the following meanings:

- `--language Japanese`: specifies that the recording is in Japanese
- `--model medium`: uses the medium-sized Whisper model
- `--output_format txt`: creates a plain-text transcription
- `--fp16 False`: uses FP32, which is suitable when processing with a CPU

The MP3 file does not need to be converted to WAV beforehand.

After processing, a text file is created in the same folder:

```text
meeting.txt
```

The first time a model is used, Whisper downloads the corresponding
model data. Processing time depends on the length of the recording and
the performance of the computer.

## Use a Smaller Model

If transcription with the `medium` model is too slow, use the `small`
model:

```powershell
whisper "meeting.mp3" --language Japanese --model small --output_format txt --fp16 False
```

A smaller model generally runs faster, although transcription accuracy
may differ.

The `turbo` model can also be used:

```powershell
whisper "meeting.mp3" --language Japanese --model turbo --output_format txt --fp16 False
```

## Create Additional Output Formats

To create subtitle files and other output formats in addition to the
plain-text file, use:

```powershell
whisper "meeting.mp3" --language Japanese --model medium --output_format all --fp16 False
```

Depending on the installed Whisper version, files such as the following
may be generated:

```text
meeting.txt
meeting.srt
meeting.vtt
meeting.tsv
meeting.json
```

For creating meeting minutes, the TXT file is usually sufficient.

## Create Meeting Minutes with ChatGPT

Upload `meeting.txt` to ChatGPT and enter a prompt such as the following:

```text
The attached file is an automatic transcription of a meeting conducted
in Japanese.

Correct obvious transcription errors, repetitions, and false starts,
and prepare meeting minutes using the following structure:

- Meeting title
- Date and time
- Participants
- Agenda
- Decisions
- Main discussion points
- Unresolved issues
- Action items
- Person responsible
- Deadline
- Items to confirm before the next meeting

Do not add facts that are not present in the transcription.

Mark uncertain names, organization names, technical terms, dates, and
numerical values as "要確認".

Clearly distinguish between confirmed decisions and ideas that were
only discussed.
```

Providing the following information together with the transcription can
improve the result:

- Participant names
- Organization names
- Project names
- Product names
- Technical terms
- Known agenda items

For example:

```text
Participants:

- Tanaka
- Sato
- Suzuki

Terms that may appear in the recording:

- ABC Project
- XYZ System
- OpenLCA
```

## Japanese Prompt Example

The following Japanese prompt can also be used:

```text
添付ファイルは、日本語で行われた会議の自動文字起こしです。

明らかな誤認識、言い直し、重複表現を修正し、次の構成で
議事録を作成してください。

- 会議名
- 日時
- 参加者
- 議題
- 決定事項
- 議論の要点
- 未決事項
- アクション項目
- 担当者
- 期限
- 次回までの確認事項

文字起こしに含まれていない事実は追加しないでください。

判断できない人名、組織名、専門用語、日付、数値には
「要確認」と記載してください。

正式に決定された事項と、単に案として議論された事項を
明確に区別してください。
```

## Troubleshooting

### The `ffmpeg` Command Is Not Found

If the following command fails:

```powershell
ffmpeg -version
```

close and reopen PowerShell after installing FFmpeg.

If it still fails, confirm that FFmpeg has been added to the Windows
`PATH` environment variable.

### The `whisper` Command Is Not Found

Try running Whisper through Python:

```powershell
py -m whisper "meeting.mp3" --language Japanese --model medium --output_format txt --fp16 False
```

Also confirm the installation:

```powershell
py -m pip show openai-whisper
```

### PowerShell Cannot Find the MP3 File

Confirm the current folder:

```powershell
Get-Location
```

List the files in the folder:

```powershell
Get-ChildItem
```

Alternatively, specify the full path to the MP3 file:

```powershell
whisper "C:\Users\username\Documents\meeting\meeting.mp3" --language Japanese --model medium --output_format txt --fp16 False
```

### The File Name Contains Spaces

Place the file name or path inside quotation marks:

```powershell
whisper "meeting recording.mp3" --language Japanese --model medium --output_format txt --fp16 False
```

## Notes

Automatic transcription may incorrectly recognize:

- Personal names
- Organization names
- Technical terms
- Abbreviations
- Dates
- Numerical values
- Statements made by overlapping speakers

The generated meeting minutes should therefore be checked against the
original recording.

Before recording or processing a meeting, confirm participant consent
and the applicable rules regarding confidential information, personal
information, and the use of external AI services.

For confidential meetings, consider removing sensitive information
before uploading the transcription to ChatGPT.

## Summary

The actual transcription command is simple:

```powershell
whisper "meeting.mp3" --language Japanese --model medium --output_format txt --fp16 False
```

Although FFmpeg is not called directly in this workflow, it must be
installed because Whisper uses it internally to read the MP3 recording.