import type { ClipEffects } from "../canvas/state";

interface props {
    setOpacity: (newVal: number) => void;
    setBrightness: (newVal: number) => void;
    setContrast: (newVal: number) => void;
    setSaturation: (newVal: number) => void;
}

export function EffectEditor({
    opacity = 1,
    brightness = 1,
    contrast = 1,
    saturation = 1,
    setBrightness,
    setOpacity,
    setContrast,
    setSaturation,
} : props & ClipEffects) {
    return (
        <div className="h-full flex flex-col bg-white">
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-6">
                    {/* Compositing Section */}
                    <div className='text-left'>
                        <label className="block text-xs font-bold mb-3 text-gray-700 uppercase tracking-wide">
                            Compositing
                        </label>
                        <div className="space-y-3">
                            <EffectBar
                                title='Opacity'
                                min={0}
                                max={100}
                                currValue={opacity * 100}
                                displayValue={`${Math.round(opacity * 100)}%`}
                                onChange={(val) => setOpacity(val / 100)}
                            />
                        </div>
                    </div>

                    {/* Color Adjustments Section */}
                    <div className='text-left'>
                        <label className="block text-xs font-bold mb-3 text-gray-700 uppercase tracking-wide">
                            Color Adjustments
                        </label>
                        <div className="space-y-3">
                            <EffectBar
                                title='Brightness'
                                min={0}
                                max={200}
                                currValue={brightness * 100}
                                displayValue={`${Math.round(brightness * 100)}%`}
                                onChange={(val) => setBrightness(val / 100)}
                            />
                            <EffectBar
                                title='Contrast'
                                min={0}
                                max={200}
                                currValue={contrast * 100}
                                displayValue={`${Math.round(contrast * 100)}%`}
                                onChange={(val) => setContrast(val / 100)}
                            />
                            <EffectBar
                                title='Saturation'
                                min={0}
                                max={200}
                                currValue={saturation * 100}
                                displayValue={`${Math.round(saturation * 100)}%`}
                                onChange={(val) => setSaturation(val / 100)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface EffectBarProps {
    title: string;
    min: number;
    max: number;
    currValue: number;
    displayValue?: string;
    onChange: (newValue: number) => void;
}

function EffectBar({
    title,
    min,
    max,
    currValue,
    displayValue,
    onChange
}: EffectBarProps) {
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-gray-600">
                    {title}
                </label>
                <span className="text-xs text-gray-500 font-mono">
                    {displayValue ?? currValue}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={currValue}
                step={1}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                onChange={(e) => {
                    onChange(parseFloat(e.target.value));
                }}
            />
        </div>
    )
}