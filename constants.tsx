
import React from 'react';

export const ICONS: { [key: string]: React.ReactNode } = {
    folder: <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5 text-yellow-500"><path d="M2 4a2 2 0 0 1 2-2h5.293a1 1 0 0 1 .707.293l2.414 2.414A1 1 0 0 0 13 5h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Z"></path></svg>,
    file: <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5 text-gray-400"><path d="M4 2a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6.414A1 1 0 0 0 16.414 6L11 1.586A1 1 0 0 0 10.414 1H4Z M5 4h5v3h3v9H5V4Z"></path></svg>,
    drive: <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5 text-gray-400"><path d="M3 3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H3Zm0 2h14v10H3V5Zm4 2a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2H8a1 1 0 0 1-1-1Z"></path></svg>,
    image: <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5 text-blue-500"><path d="m13 13-3-3-3 3h6Zm2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2ZM5 6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5Z"></path></svg>,
    archive: <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5 text-orange-500"><path d="M9.414 1H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6.414A1 1 0 0 0 16.414 6L11 1.586A1 1 0 0 0 9.414 1ZM9 3v4h4V3h-4ZM5 8h2v2H5V8Zm0 3h2v2H5v-2Zm0 3h2v2H5v-2Zm3-3h6v2H8v-2Zm0 3h6v2H8v-2Z"></path></svg>,
    document: <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5 text-blue-400"><path d="M4 2a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6.414A1 1 0 0 0 16.414 6L11 1.586A1 1 0 0 0 10.414 1H4ZM5 4h5v3h3v9H5V4Zm2 6h6v1H7v-1Zm0 2h6v1H7v-1Z"></path></svg>,
    music: <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5 text-purple-500"><path d="M10 2a1 1 0 0 0-1 1v10.553a2.5 2.5 0 1 0 2 1.947V4a1 1 0 0 0-1-1Z"></path></svg>,
    lock: <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5"><path fillRule="evenodd" d="M10 2a4 4 0 0 0-4 4v2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4Zm0 2a2 2 0 0 0-2 2v2h4V6a2 2 0 0 0-2-2Z" clipRule="evenodd"></path></svg>,
    home: <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5"><path d="m10 2-8 6.586V18h4v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4h4V8.586L10 2Z"></path></svg>,
    desktop: <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5"><path d="M2 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5Zm2-1v7h12V4H4Zm-2 9h16v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-1Z"></path></svg>,
    documents: <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5"><path d="M4 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4Zm0 2h12v12H4V4Zm2 2v1h8V6H6Zm0 3v1h8V9H6Zm0 3v1h5v-1H6Z"></path></svg>,
    downloads: <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5"><path d="M10 2a1 1 0 0 0-1 1v5.586l-1.293-1.293a1 1 0 1 0-1.414 1.414l3 3a1 1 0 0 0 1.414 0l3-3a1 1 0 1 0-1.414-1.414L11 8.586V3a1 1 0 0 0-1-1ZM3 14a1 1 0 0 0 1 1h12a1 1 0 1 0 0-2H4a1 1 0 0 0-1 1Z"></path></svg>,
    pictures: <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5"><path d="m13 13-3-3-3 3h6Zm2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2ZM5 6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5Z"></path></svg>,
    cloud: <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5"><path d="M16.5 10A4.5 4.5 0 0 0 13 6.051V6a5 5 0 0 0-9.873.916A3.5 3.5 0 0 0 6.5 16H8v-2H6.5a1.5 1.5 0 1 1 .16-2.986L7 11.002V10a3 3 0 0 1 5.92-1H13a2.5 2.5 0 0 1 0 5h1.5a2.5 2.5 0 0 0 2.5-2.5Z"></path></svg>,
    sun: <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5"><path d="M10 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 14a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1ZM3.536 4.95a1 1 0 0 1 0 1.414L4.95 7.778a1 1 0 1 1-1.414-1.414l-1.414-1.414ZM12.222 13.636a1 1 0 1 1-1.414-1.414l1.414-1.414a1 1 0 0 1 1.414 1.414ZM4.95 16.464a1 1 0 0 1 1.414 0l1.414-1.414a1 1 0 1 1-1.414-1.414L4.95 12.222ZM15.05 3.536a1 1 0 1 1-1.414 1.414L12.222 6.364a1 1 0 0 1-1.414-1.414l1.414-1.414Zm-1.414 11.514a1 1 0 0 1 1.414 0l1.414 1.414a1 1 0 0 1-1.414 1.414l-1.414-1.414ZM2 10a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1Zm14 0a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1Zm-5-7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"></path></svg>,
    moon: <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-5 h-5"><path d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-2a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm-2.5-4a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5Z"></path></svg>,
    sparkles: <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-4 h-4"><path d="M10 2.5a.75.75 0 0 1 .75.75V5h1.75a.75.75 0 0 1 0 1.5H10.75V8.25a.75.75 0 0 1-1.5 0V6.5H7.5a.75.75 0 0 1 0-1.5H9.25V3.25A.75.75 0 0 1 10 2.5ZM5 6.5a.75.75 0 0 1 .75-.75H7.5V3.25a.75.75 0 0 1 1.5 0V5.75h2.25a.75.75 0 0 1 0 1.5H8.25v2.25a.75.75 0 0 1-1.5 0V7.25H5.75A.75.75 0 0 1 5 6.5ZM14.25 10a.75.75 0 0 0-1.5 0v1.75H11a.75.75 0 0 0 0 1.5h1.75V15a.75.75 0 0 0 1.5 0v-1.75H16a.75.75 0 0 0 0-1.5h-1.75v-1.75Z M10 11.75a.75.75 0 0 0-1.5 0V14h-2.25a.75.75 0 0 0 0 1.5H8.5v2.25a.75.75 0 0 0 1.5 0V15.5h2.25a.75.75 0 0 0 0-1.5H10v-2.25Z"></path></svg>,
};

export const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'svg':
            return ICONS.image;
        case 'zip':
        case 'rar':
        case '7z':
            return ICONS.archive;
        case 'doc':
        case 'docx':
        case 'pdf':
        case 'txt':
        case 'md':
            return ICONS.document;
        case 'mp3':
        case 'wav':
        case 'ogg':
            return ICONS.music;
        default:
            return ICONS.file;
    }
};
