import React, { useRef, useEffect, useState } from 'react';
import { FileSystemItem, FileType } from '../types';
import { getFileIcon } from '../constants';

interface PreviewPaneProps {
    item: FileSystemItem;
    path: string;
    onClose: () => void;
}

const isImage = (filename: string) => /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(filename);
const isText = (filename: string) => /\.(txt|md)$/i.test(filename);
const isPdf = (filename: string) => /\.pdf$/i.test(filename);
const isVideo = (filename: string) => /\.(mp4|webm|ogg)$/i.test(filename);
const isAudio = (filename: string) => /\.(mp3|ogg|wav)$/i.test(filename);

// New component to handle PDF rendering
const PdfPreview: React.FC<{ path: string }> = ({ path }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const renderPdf = async () => {
            try {
                const pdfjsLib = (window as any).pdfjsLib;
                if (!pdfjsLib) {
                    console.error('pdf.js is not loaded.');
                    setLoading(false);
                    return;
                }
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

                // NOTE: Using a placeholder URL because the mock file system does not provide actual file URLs.
                // In a real application, `path` would be resolved to a downloadable URL.
                const url = 'https://arxiv.org/pdf/1706.03762.pdf';
                
                const pdf = await pdfjsLib.getDocument(url).promise;
                const page = await pdf.getPage(1); // Render the first page
                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext('2d');
                if (!context) return;

                const viewport = page.getViewport({ scale: 1.5 });
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport }).promise;
            } catch (error) {
                console.error('Failed to render PDF', error);
            } finally {
                setLoading(false);
            }
        };

        renderPdf();
    }, [path]);

    return (
        <div className="w-full h-full flex items-center justify-center">
            {loading && <p className="text-explorer-text-secondary text-sm">Loading...</p>}
            <canvas
                ref={canvasRef}
                className="max-w-full max-h-full"
                style={{ display: loading ? 'none' : 'block' }}
            />
        </div>
    );
};

const ImagePreview: React.FC<{ itemName: string }> = ({ itemName }) => {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center text-explorer-text-secondary text-sm">
                    Loading preview...
                </div>
            )}
            <img
                src={`https://picsum.photos/seed/${itemName}/400`}
                alt={itemName}
                className={`max-w-full max-h-full object-contain rounded-md transition-opacity duration-500 ${
                    isLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)} // Handle image load errors as well
            />
        </div>
    );
};

const TextPreview: React.FC<{ itemName: string }> = ({ itemName }) => {
    // Mock content for demonstration
    const mockContent: { [key: string]: string } = {
        'readme.md': '# Project Readme\n\nThis is a sample readme file for the file explorer.\n\n- Feature 1: Dual-pane view\n- Feature 2: Tabbed browsing\n- Feature 3: File previews',
        'notes.txt': 'Shopping List\n- Milk\n- Bread\n- Eggs\n\nMeeting Notes\n- Discuss Q4 roadmap\n- Finalize budget for new project',
        'default': `This is a preview of the content for ${itemName}.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat.`
    };
    const content = mockContent[itemName] || mockContent['default'];

    return (
        <div className="w-full h-full bg-explorer-bg rounded-md p-2 text-left overflow-y-auto">
            <pre className="text-xs text-explorer-text whitespace-pre-wrap break-words">
                {content}
            </pre>
        </div>
    );
};

const VideoPreview: React.FC<{ path: string }> = ({ path }) => {
    // NOTE: Using a placeholder URL because the mock file system does not provide actual file URLs.
    // In a real application, `path` would be resolved to a downloadable URL.
    const videoUrl = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4';
    
    return (
    <div className="w-full h-full flex items-center justify-center bg-explorer-bg rounded-md">
            <video
                key={path} // Add key to force re-render on item change
                src={videoUrl}
                controls
                className="max-w-full max-h-full"
                aria-label="Video preview"
            >
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

const AudioPreview: React.FC<{ path: string }> = ({ path }) => {
    // NOTE: Using a placeholder URL because the mock file system does not provide actual file URLs.
    const audioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

    return (
        <div className="w-full flex items-center justify-center">
             <audio
                key={path}
                src={audioUrl}
                controls
                className="w-full"
                aria-label="Audio preview"
            >
                Your browser does not support the audio element.
            </audio>
        </div>
    );
};


export const PreviewPane: React.FC<PreviewPaneProps> = ({ item, path, onClose }) => {
    const renderPreview = () => {
        if (item.type === FileType.Directory) {
            return <div className="w-24 h-24 text-explorer-text-secondary">{getFileIcon(item.name)}</div>;
        }

        if (isPdf(item.name)) {
            return <PdfPreview path={path} />;
        }
        if (isImage(item.name)) {
            return <ImagePreview itemName={item.name} />;
        }
        if (isText(item.name)) {
            return <TextPreview itemName={item.name} />;
        }
        if (isVideo(item.name)) {
            return <VideoPreview path={path} />;
        }
        if (isAudio(item.name)) {
            return <AudioPreview path={path} />;
        }
        
        // Fallback for unsupported file types
        return <div className="w-24 h-24 text-explorer-text-secondary">{getFileIcon(item.name)}</div>;
    };

    return (
        <aside className="w-80 bg-explorer-bg-secondary border-l border-explorer-border flex flex-col p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold">Preview</h2>
                <button onClick={onClose} className="p-1.5 rounded-full hover:bg-explorer-hover">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center">
                 <div className="w-full h-48 mb-4 flex items-center justify-center">
                    {renderPreview()}
                 </div>

                <p className="font-semibold break-all">{item.name}</p>
                <p className="text-sm text-explorer-text-secondary">{item.type === FileType.File ? 'File' : 'Folder'}</p>

                <div className="text-left text-sm mt-6 w-full space-y-2">
                    <div className="flex justify-between">
                        <span className="text-explorer-text-secondary">Size:</span>
                        <span>{item.size || '--'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-explorer-text-secondary">Modified:</span>
                        <span>{item.modified || '--'}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};