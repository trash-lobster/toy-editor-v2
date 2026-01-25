interface HeaderProps {
    toggleLeftPanel?: () => void;
    toggleRightPanel?: () => void;
}

export function Header({toggleLeftPanel, toggleRightPanel}: HeaderProps) {
    return (
        <header className='flex justify-between w-full border-b border-bottom border-black items-center px-4'>
            <b>Timeline Editor</b>
            <div className='flex items-center gap-2 py-1'>
                <div className='flex gap-2'>
                    <button className='bg-gray-200 px-2 py-1 text-sm rounded-sm' onClick={toggleLeftPanel}>Left</button>
                    <button className='bg-gray-200 px-2 py-1 text-sm rounded-sm' onClick={toggleRightPanel}>Right</button>
                </div>
                <div className='h-6 w-px bg-black'/>
                <button className='bg-black text-white px-4 py-2 text-sm rounded-sm'>Export</button>
            </div>
        </header>
    )
}