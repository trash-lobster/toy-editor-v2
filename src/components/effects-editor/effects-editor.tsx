export function EffectEditor() {
    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                    <div className='text-left'>
                        <label className="block text-xs font-bold mb-2">
                            Compositing
                        </label>
                        <div className="space-y-2">
                            <div>
                                <label className="block text-xs mb-1">
                                    Opacity
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    defaultValue="100"
                                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-filmforge-text-secondary mt-8">
                        <p className="text-xs opacity-60">
                            Additional properties will appear here
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
