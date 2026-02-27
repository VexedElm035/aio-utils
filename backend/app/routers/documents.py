from io import BytesIO
import zipfile
from typing import List

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse, StreamingResponse

from app.services.pdf_service import (
    compress_pdf_bytes,
    convert_pdf_to_docx,
    ocr_pdf_bytes,
    remove_pdf_text_layer,
    render_pdf_page_image,
    render_pdf_preview_png,
    render_pdf_images_zip,
    read_pdf_page_count,
)

router = APIRouter(prefix="/api/pdf", tags=["pdf"])


@router.post("/compress")
async def compress_pdf(
    file: UploadFile = File(...),
    preset: str = Form("quality"),
):
    if preset not in {"native", "quality", "balanced", "max"}:
        raise HTTPException(status_code=400, detail="Invalid preset.")
    if file.content_type not in ("application/pdf", "application/x-pdf"):
        raise HTTPException(status_code=415, detail="Only PDF files are supported.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file.")

    try:
        compressed = compress_pdf_bytes(data, preset=preset)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    filename = file.filename or "compressed.pdf"
    if not filename.lower().endswith(".pdf"):
        filename = f"{filename}.pdf"

    safe_filename = filename.replace("\"", "").replace("\n", "").replace("\r", "")
    headers = {"Content-Disposition": f'attachment; filename="{safe_filename}"'}

    return StreamingResponse(
        BytesIO(compressed),
        media_type="application/pdf",
        headers=headers,
    )


@router.post("/compress/batch")
async def compress_pdf_batch(
    files: List[UploadFile] = File(...),
    preset: str = Form("quality"),
):
    if preset not in {"native", "quality", "balanced", "max"}:
        raise HTTPException(status_code=400, detail="Invalid preset.")
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")

    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", compression=zipfile.ZIP_DEFLATED) as zip_file:
        for index, file in enumerate(files, start=1):
            if file.content_type not in ("application/pdf", "application/x-pdf"):
                raise HTTPException(status_code=415, detail="Only PDF files are supported.")

            data = await file.read()
            if not data:
                raise HTTPException(status_code=400, detail="Empty file.")

            try:
                compressed = compress_pdf_bytes(data, preset=preset)
            except ValueError as exc:
                raise HTTPException(status_code=400, detail=str(exc)) from exc

            filename = file.filename or f"compressed-{index}.pdf"
            if not filename.lower().endswith(".pdf"):
                filename = f"{filename}.pdf"

            base_name = filename.rsplit(".pdf", 1)[0]
            safe_name = base_name.replace("\"", "").replace("\n", "").replace("\r", "")
            zip_name = f"{safe_name}-compressed.pdf"

            zip_file.writestr(zip_name, compressed)

    zip_buffer.seek(0)
    headers = {"Content-Disposition": "attachment; filename=compressed-pdfs.zip"}
    return StreamingResponse(zip_buffer, media_type="application/zip", headers=headers)


@router.post("/preview")
async def preview_pdf(file: UploadFile = File(...)):
    if file.content_type not in ("application/pdf", "application/x-pdf"):
        raise HTTPException(status_code=415, detail="Only PDF files are supported.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file.")

    try:
        preview_png = render_pdf_preview_png(data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return StreamingResponse(
        BytesIO(preview_png),
        media_type="image/png",
    )


@router.post("/page-count")
async def pdf_page_count(file: UploadFile = File(...)):
    if file.content_type not in ("application/pdf", "application/x-pdf"):
        raise HTTPException(status_code=415, detail="Only PDF files are supported.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file.")

    try:
        page_count = read_pdf_page_count(data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return JSONResponse({"pages": page_count})


@router.post("/convert/docx")
async def convert_pdf_docx(file: UploadFile = File(...)):
    if file.content_type not in ("application/pdf", "application/x-pdf"):
        raise HTTPException(status_code=415, detail="Only PDF files are supported.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file.")

    try:
        docx_bytes = convert_pdf_to_docx(data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    filename = file.filename or "document.pdf"
    base_name = filename.rsplit(".pdf", 1)[0]
    safe_name = base_name.replace("\"", "").replace("\n", "").replace("\r", "")
    headers = {"Content-Disposition": f'attachment; filename="{safe_name}.docx"'}

    return StreamingResponse(
        BytesIO(docx_bytes),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers=headers,
    )


@router.post("/convert/images")
async def convert_pdf_images(
    file: UploadFile = File(...),
    image_format: str = Form("png"),
):
    if image_format not in {"png", "jpg"}:
        raise HTTPException(status_code=400, detail="Invalid image format.")
    if file.content_type not in ("application/pdf", "application/x-pdf"):
        raise HTTPException(status_code=415, detail="Only PDF files are supported.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file.")

    filename = file.filename or "document.pdf"
    base_name = filename.rsplit(".pdf", 1)[0]
    safe_name = base_name.replace("\"", "").replace("\n", "").replace("\r", "")

    try:
        zip_bytes = render_pdf_images_zip(data, image_format=image_format, prefix=safe_name)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    headers = {"Content-Disposition": f'attachment; filename="{safe_name}-images.zip"'}

    return StreamingResponse(
        BytesIO(zip_bytes),
        media_type="application/zip",
        headers=headers,
    )


@router.post("/convert/image")
async def convert_pdf_image(
    file: UploadFile = File(...),
    page: int = Form(1),
    image_format: str = Form("png"),
):
    if image_format not in {"png", "jpg"}:
        raise HTTPException(status_code=400, detail="Invalid image format.")
    if page < 1:
        raise HTTPException(status_code=400, detail="Invalid page number.")
    if file.content_type not in ("application/pdf", "application/x-pdf"):
        raise HTTPException(status_code=415, detail="Only PDF files are supported.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file.")

    try:
        image_bytes = render_pdf_page_image(data, page_index=page - 1, image_format=image_format)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    filename = file.filename or "document.pdf"
    base_name = filename.rsplit(".pdf", 1)[0]
    safe_name = base_name.replace("\"", "").replace("\n", "").replace("\r", "")
    headers = {
        "Content-Disposition": f'attachment; filename="{safe_name}-page-{page:03d}.{image_format}"'
    }

    media_type = "image/png" if image_format == "png" else "image/jpeg"
    return StreamingResponse(
        BytesIO(image_bytes),
        media_type=media_type,
        headers=headers,
    )


@router.post("/ocr/apply")
async def apply_pdf_ocr(file: UploadFile = File(...)):
    if file.content_type not in ("application/pdf", "application/x-pdf"):
        raise HTTPException(status_code=415, detail="Only PDF files are supported.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file.")

    try:
        ocr_bytes = ocr_pdf_bytes(data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    filename = file.filename or "document.pdf"
    base_name = filename.rsplit(".pdf", 1)[0]
    safe_name = base_name.replace("\"", "").replace("\n", "").replace("\r", "")
    headers = {"Content-Disposition": f'attachment; filename="{safe_name}-ocr.pdf"'}

    return StreamingResponse(
        BytesIO(ocr_bytes),
        media_type="application/pdf",
        headers=headers,
    )


@router.post("/ocr/remove")
async def remove_pdf_ocr(file: UploadFile = File(...)):
    if file.content_type not in ("application/pdf", "application/x-pdf"):
        raise HTTPException(status_code=415, detail="Only PDF files are supported.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file.")

    try:
        cleaned = remove_pdf_text_layer(data)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    filename = file.filename or "document.pdf"
    base_name = filename.rsplit(".pdf", 1)[0]
    safe_name = base_name.replace("\"", "").replace("\n", "").replace("\r", "")
    headers = {"Content-Disposition": f'attachment; filename="{safe_name}-no-ocr.pdf"'}

    return StreamingResponse(
        BytesIO(cleaned),
        media_type="application/pdf",
        headers=headers,
    )
