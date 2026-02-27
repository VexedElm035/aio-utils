import { PiTrashBold } from "react-icons/pi";
import type { PdfItem } from "../views/documents/pdfoptions/PdfView";

interface PdfCardProps {
    item: PdfItem;
    onRemove: (id: string) => void;
}

const PdfCard = ({ item, onRemove }: PdfCardProps) => {
    return (
        <>
            <div className='flex w-40 lg:w-48 min-h-52 lg:min-h-72 items-center justify-center'>
                {item.isPreviewLoading && (
                    <p className='text-xs text-text-muted font-ui'>Generando vista previa...</p>
                )}
                {!item.isPreviewLoading && item.previewUrl && (
                    <img src={item.previewUrl} alt={`Vista previa de ${item.file.name}`} className="max-w-full" />
                )}
                {!item.isPreviewLoading && item.previewError && (
                    <p className='text-xs text-error font-ui'>{item.previewError}</p>
                )}
            </div>

            <div className='w-full flex flex-col gap-1 mt-1'>
                <p className='truncate text-xs font-ui text-text' title={item.file.name}>
                    {item.file.name}
                </p>
                <div className='flex items-center w-full justify-center border-b border-border-dark pb-1'>
                    <p className='text-xs text-text-muted font-ui'>
                        {(item.file.size / 1000000).toFixed(2)} MB
                    </p>
                </div>
                <button
                    className='retro-btn-danger flex items-center justify-center gap-1 mx-auto mt-1 px-2 py-1 text-xs'
                    type='button'
                    onClick={(event) => {
                        event.stopPropagation()
                        onRemove(item.id)
                    }}
                >
                    <PiTrashBold className='inline text-xs' />
                    <span>Eliminar</span>
                </button>
            </div>
        </>
    );
};

export default PdfCard;
