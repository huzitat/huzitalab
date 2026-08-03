import cv2
import os
import glob

# パラメータ設定
image_folder = "images"  # 画像フォルダのパス
output_video = "timelapse.mp4"  # 出力動画ファイル名
frame_rate = 30  # フレームレート（例：30fps）

# 画像ファイル一覧を取得（連番ファイルを想定）
image_files = sorted(glob.glob(os.path.join(image_folder, "*.jpg")))

if not image_files:
    raise ValueError("指定フォルダに画像がありません。")

# 最初の画像から解像度を取得
first_image = cv2.imread(image_files[0])
height, width, layers = first_image.shape
resolution = (width, height)

# 動画ライターの設定
fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # MP4用コーデック
video_writer = cv2.VideoWriter(output_video, fourcc, frame_rate, resolution)

# 画像を順に動画に追加
for img_file in image_files:
    img = cv2.imread(img_file)
    if img is None:
        print(f"警告: {img_file} を読み込めません。スキップします。")
        continue
    img_resized = cv2.resize(img, resolution)
    video_writer.write(img_resized)

video_writer.release()
print(f"タイムラプス動画を作成しました: {output_video}")
