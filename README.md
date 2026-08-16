# Hướng dẫn đồng bộ ảnh — Portfolio Sinh (gallery) v3

Ảnh trên website lấy từ Cloudinary. File `src/data/portfolio.js` trong project được tạo lại từ Cloudinary mỗi lần sync.

Thư mục project:
`C:\Users\needf\Documents\Portfolio Sinh (gallery) v3`

---

## 1. Thêm / thay ảnh (khuyên dùng)

### Cách A — Làm trực tiếp trên Cloudinary

1. Vào Cloudinary → Media Library.
2. Vào đúng folder album (vd. `portrait`, `Graduation Photography`).
3. Upload ảnh mới, hoặc thay / xóa ảnh cũ.
4. Album mới = tạo folder mới trên Cloudinary.
5. Sync lại project (mục 3).

### Cách B — Upload từ máy

1. Xếp ảnh theo album:
   ```
   public/images/
     Portrait/
       anh1.jpg
     Graduation Photography/
       anh1.jpg
   ```
2. Mở PowerShell trong thư mục project.
3. Chạy:
   ```powershell
   . .\set_cloudinary_env.ps1
   python .\upload_images_to_cloudinary.py --yes
   python .\update_cloudinary_portfolio.py
   ```
4. Reload website.

---

## 2. Xóa ảnh hoặc folder trên Cloudinary

| Bạn làm trên Cloudinary | App trước khi sync | Sau khi sync |
|-------------------------|--------------------|--------------|
| Xóa vài ảnh             | Ảnh đó bị gãy (404)| Biến mất khỏi album |
| Xóa cả folder (album)   | Album vẫn hiện, ảnh gãy | Album biến mất khỏi wheel / gallery |
| Thêm ảnh / folder mới   | Chưa thấy          | Xuất hiện sau sync |

Lưu ý: Xóa trên Cloudinary không tự cập nhật website. Phải chạy sync (mục 3).

Cover của album = ảnh đầu tiên trong folder.

---

## 3. Sync project (bắt buộc sau mọi thay đổi)

Mở PowerShell tại thư mục project, rồi chạy:

```powershell
cd "C:\Users\needf\Documents\Portfolio Sinh (gallery) v3"
. .\set_cloudinary_env.ps1
python .\update_cloudinary_portfolio.py
```

Script sẽ ghi lại `src\data\portfolio.js`.

Sau đó:
- Reload trang web (hoặc chạy lại `npm run dev` nếu chưa chạy).
- Kiểm tra OptionWheel + Gallery xem album / ảnh đã đúng chưa.

---

## 4. Các script liên quan

| Script | Việc làm |
|--------|----------|
| `set_cloudinary_env.ps1` | Nạp API key Cloudinary cho phiên PowerShell hiện tại |
| `update_cloudinary_portfolio.py` | Đọc folder trên Cloudinary → tạo lại `portfolio.js` |
| `upload_images_to_cloudinary.py` | Upload từ `public/images` lên Cloudinary |
| `sync_from_cloudinary.py` | Đồng bộ ngược (tải / xóa local cho khớp Cloudinary) |

---

## 5. Quy tắc nhanh

1. Cloudinary là nguồn chính — đừng sửa tay `portfolio.js` lâu dài (lần sync sau sẽ ghi đè).
2. Mỗi album = 1 folder trên Cloudinary.
3. Mọi thay đổi ảnh → chạy lại `update_cloudinary_portfolio.py`.
4. Folder trống / đã xóa sẽ không còn trong website sau khi sync.

---

## 6. Checklist khi cập nhật ảnh

- [ ] Upload / xóa / đổi folder trên Cloudinary (hoặc upload từ `public/images`)
- [ ] Chạy `. .\set_cloudinary_env.ps1`
- [ ] Chạy `python .\update_cloudinary_portfolio.py`
- [ ] Reload app và kiểm tra Home + Gallery

---

## 7. Ghi chú kỹ thuật

- `src/data/portfolio.js` là file sinh ra, không phải file nguồn lâu dài.
- `public/images` là thư mục local dùng cho upload / backup / đồng bộ khi cần.
- Luôn sync sau khi đổi folder hoặc ảnh trên Cloudinary để tránh gallery stale.
- Nếu cần đồng bộ ngược với Cloudinary, có thể dùng `sync_from_cloudinary.py` với các tùy chọn `--download` và `--delete-local` sau khi kiểm tra kỹ.

Security note: giữ API secret ra khỏi source control; ưu tiên `.env` hoặc biến môi trường của platform.

