from io import BytesIO
import os
import subprocess
import tempfile
import zipfile

import fitz
from pdf2docx import Converter


def compress_pdf_bytes(data: bytes, preset: str = "quality") -> bytes:
    try:
        doc = fitz.open(stream=data, filetype="pdf")
    except Exception as exc:
        raise ValueError("Invalid PDF data.") from exc

    try:
        output = BytesIO()
        if preset == "native":
            doc.save(
                output,
                garbage=1,
                deflate=True,
                clean=False,
                incremental=False,
                deflate_images=False,
                deflate_fonts=False,
            )
            return output.getvalue()

        if preset == "quality":
            doc.save(
                output,
                garbage=4,
                deflate=True,
                clean=True,
                incremental=False,
                deflate_images=True,
                deflate_fonts=True,
            )
            return output.getvalue()
    finally:
        doc.close()

    if preset == "balanced":
        return rasterize_pdf_bytes(data, zoom=1.5, use_grayscale=False)

    if preset == "max":
        return rasterize_pdf_bytes(data, zoom=1.0, use_grayscale=False)

    raise ValueError("Invalid preset.")


def rasterize_pdf_bytes(data: bytes, zoom: float, use_grayscale: bool) -> bytes:
    try:
        doc = fitz.open(stream=data, filetype="pdf")
    except Exception as exc:
        raise ValueError("Invalid PDF data.") from exc

    output_doc = fitz.open()
    try:
        matrix = fitz.Matrix(zoom, zoom)

        colorspace = fitz.csGRAY if use_grayscale else fitz.csRGB

        for page_index in range(doc.page_count):
            page = doc.load_page(page_index)
            pixmap = page.get_pixmap(matrix=matrix, colorspace=colorspace, alpha=False)
            image_bytes = pixmap.tobytes("jpeg")

            rect = fitz.Rect(0, 0, pixmap.width, pixmap.height)
            output_page = output_doc.new_page(width=rect.width, height=rect.height)
            output_page.insert_image(rect, stream=image_bytes)

        output_buffer = BytesIO()
        output_doc.save(output_buffer, deflate=True, garbage=4, clean=True)
        return output_buffer.getvalue()
    finally:
        doc.close()
        output_doc.close()


def remove_pdf_text_layer(data: bytes, zoom: float = 2.0) -> bytes:
    return rasterize_pdf_bytes(data, zoom=zoom, use_grayscale=False)


def render_pdf_preview_png(data: bytes, zoom: float = 2.0) -> bytes:
    try:
        doc = fitz.open(stream=data, filetype="pdf")
    except Exception as exc:
        raise ValueError("Invalid PDF data.") from exc

    try:
        if doc.page_count == 0:
            raise ValueError("PDF has no pages.")

        page = doc.load_page(0)
        matrix = fitz.Matrix(zoom, zoom)
        pixmap = page.get_pixmap(matrix=matrix)
        return pixmap.tobytes("png")
    finally:
        doc.close()


def read_pdf_page_count(data: bytes) -> int:
    try:
        doc = fitz.open(stream=data, filetype="pdf")
    except Exception as exc:
        raise ValueError("Invalid PDF data.") from exc

    try:
        return doc.page_count
    finally:
        doc.close()


def render_pdf_page_image(
    data: bytes,
    page_index: int,
    image_format: str,
    zoom: float = 2.0,
) -> bytes:
    try:
        doc = fitz.open(stream=data, filetype="pdf")
    except Exception as exc:
        raise ValueError("Invalid PDF data.") from exc

    try:
        if doc.page_count == 0:
            raise ValueError("PDF has no pages.")
        if page_index < 0 or page_index >= doc.page_count:
            raise ValueError("Page out of range.")

        page = doc.load_page(page_index)
        matrix = fitz.Matrix(zoom, zoom)
        pixmap = page.get_pixmap(matrix=matrix, alpha=False)
        output_format = "png" if image_format == "png" else "jpeg"
        return pixmap.tobytes(output_format)
    finally:
        doc.close()


def render_pdf_images_zip(
    data: bytes,
    image_format: str,
    zoom: float = 2.0,
    prefix: str = "page",
) -> bytes:
    try:
        doc = fitz.open(stream=data, filetype="pdf")
    except Exception as exc:
        raise ValueError("Invalid PDF data.") from exc

    zip_buffer = BytesIO()
    try:
        if doc.page_count == 0:
            raise ValueError("PDF has no pages.")

        output_format = "png" if image_format == "png" else "jpeg"

        with zipfile.ZipFile(zip_buffer, "w", compression=zipfile.ZIP_DEFLATED) as zip_file:
            for page_index in range(doc.page_count):
                page = doc.load_page(page_index)
                matrix = fitz.Matrix(zoom, zoom)
                pixmap = page.get_pixmap(matrix=matrix, alpha=False)
                image_bytes = pixmap.tobytes(output_format)
                zip_name = f"{prefix}-{page_index + 1:03d}.{image_format}"
                zip_file.writestr(zip_name, image_bytes)

        return zip_buffer.getvalue()
    finally:
        doc.close()


def convert_pdf_to_docx(data: bytes) -> bytes:
    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as pdf_file:
            pdf_file.write(data)
            pdf_path = pdf_file.name

        with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as docx_file:
            docx_path = docx_file.name

        converter = Converter(pdf_path)
        try:
            converter.convert(docx_path)
        finally:
            converter.close()

        with open(docx_path, "rb") as output_file:
            return output_file.read()
    except Exception as exc:
        raise ValueError("Failed to convert PDF to DOCX.") from exc


def ocr_pdf_bytes(data: bytes, language: str = "spa+eng") -> bytes:
    pdf_path = None
    output_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as pdf_file:
            pdf_file.write(data)
            pdf_path = pdf_file.name

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as output_file:
            output_path = output_file.name

        result = subprocess.run(
            [
                "ocrmypdf",
                "--skip-text",
                "--deskew",
                "--optimize",
                "1",
                "--language",
                language,
                pdf_path,
                output_path,
            ],
            capture_output=True,
            text=True,
            check=False,
        )

        if result.returncode != 0:
            message = (result.stderr or result.stdout or "OCR failed.").strip()
            raise ValueError(message)

        with open(output_path, "rb") as output_file:
            return output_file.read()
    except ValueError:
        raise
    except Exception as exc:
        raise ValueError("Failed to apply OCR.") from exc
    finally:
        if pdf_path and os.path.exists(pdf_path):
            os.remove(pdf_path)
        if output_path and os.path.exists(output_path):
            os.remove(output_path)
