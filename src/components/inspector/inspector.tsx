import { Upload } from "lucide-react";
import type { InspectorTab } from "./state"
import { useRef } from "react";

interface InspectorProps {
    currentTab: InspectorTab,
    setTab: (tab: InspectorTab) => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, fileInputRef: React.RefObject<HTMLInputElement | null>) => 
        Promise<{
            status: string;
        } | undefined>;
}

const tabs: { id: InspectorTab; label: string }[] = [
    { id: 'media', label: 'Media' },
    { id: 'audio', label: 'Audio' },
    { id: 'text', label: 'Text' }
];

export function Inspector({currentTab, setTab, handleFileUpload} : InspectorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    console.log('re-rendered');
    
    return (
        <div>
            <div className='flex gap-4 items-middle justify-center py-4 border-b'>
                {tabs.map(tab => (
                    <button 
                        key={tab.id}
                        className={`px-3 py-1 rounded hover:bg-gray-200 transition-colors cursor-pointer ${currentTab === tab.id ? 'bg-gray-200' : ''}`}
                        onClick={() => setTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className='text-center mt-8'>
                {
                    currentTab === 'media' ? 
                        <div className="mx-4">
                            <div className="space-y-2">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="video/*,image/*"
                                    multiple
                                    onChange={async (e) => handleFileUpload(e, fileInputRef)}
                                    className="hidden"
                                    id="media-upload"
                                />
                                <label
                                    htmlFor="media-upload"
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-filmforge-text cursor-pointer transition-colors border border-filmforge-border-light rounded"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span className="text-sm font-bold">Upload Media</span>
                                </label>
                                <p className="text-xs text-filmforge-text-muted text-center">
                                    Supports MP4, MOV, JPG, PNG
                                </p>
                            </div>
                        </div>
                    :
                    currentTab === 'audio' ?
                        <p className='text-xs opacity-60'>Audio tools will appear here</p>
                    :
                        <p className='text-xs opacity-60'>Text tools will appear here</p>
                }
            </div>
        </div>
    )
}