from pathlib import Path
from PIL import Image, ImageSequence


def process_images(target_path):
    # 转换为 Path 对象并去除可能的引号（拖入文件夹时 Windows 会自动加引号）
    root_dir = Path(target_path.strip().replace('"', ""))

    if not root_dir.exists():
        print(f"!!! 路径不存在: {root_dir}")
        return

    valid_extensions = (".png", ".gif")
    success_count = 0
    error_count = 0

    # rglob('*') 递归遍历所有子文件夹
    for path in root_dir.rglob("*"):
        if path.suffix.lower() in valid_extensions:
            dest_path = path.with_suffix(".webp")

            try:
                with Image.open(path) as img:
                    if getattr(img, "is_animated", False):
                        frames = []
                        # 核心逻辑：逐帧取出并强制转 RGBA 渲染
                        # 这步操作会消除 APNG/GIF 原始编码中的帧残留指令
                        frames.extend(
                            frame.convert("RGBA")
                            for frame in ImageSequence.Iterator(img)
                        )
                        # 保存动态 WebP
                        # disposal=2 指示播放器在每一帧之后清空画布，这是解决拖影的银弹
                        frames[0].save(
                            dest_path,
                            save_all=True,
                            append_images=frames[1:],
                            lossless=True,
                            loop=0,
                            disposal=2,
                            quality=100,
                        )
                    else:
                        # 静态图处理：保持无损 RGBA
                        img.convert("RGBA").save(dest_path, "WEBP", lossless=True)

                # 转换成功后删除原文件
                path.unlink()
                print(f"[成功] {path.name} -> {dest_path.name}")
                success_count += 1

            except Exception as e:
                print(f"[错误] 处理 {path.name} 时出错: {e}")
                error_count += 1

    print("\n--- 任务完成 ---")
    print(f"成功: {success_count} 个")
    print(f"失败: {error_count} 个")


if __name__ == "__main__":
    while True:
        print("\n" + "=" * 50)
        print("请输入或【拖入文件夹】后回车 (输入 'q' 退出):")
        user_input = input("> ").strip()

        if user_input.lower() == "q":
            break

        if user_input:
            process_images(user_input)
        else:
            print("请输入有效的路径。")
