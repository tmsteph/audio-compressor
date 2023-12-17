import React, { useState, useEffect } from 'react';

const eqFrequencies = [60, 170, 350, 1000, 3500, 10000]; // Example EQ frequencies

const App = () => {
    const [isCapturing, setIsCapturing] = useState(false);
    const [compressor, setCompressor] = useState(null);
    const [eqFilters, setEqFilters] = useState([]);

    useEffect(() => {
        if (!isCapturing) return;

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const comp = audioCtx.createDynamicsCompressor();

        const filters = eqFrequencies.map(freq => {
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'peaking';
            filter.frequency.value = freq;
            filter.Q.value = 1;
            filter.gain.value = 0;
            return filter;
        });

        setCompressor(comp);
        setEqFilters(filters);

        let lastNode = comp;
        filters.forEach(filter => {
            lastNode.connect(filter);
            lastNode = filter;
        });
        lastNode.connect(audioCtx.destination);

        navigator.mediaDevices.getDisplayMedia({ video: false, audio: true })
            .then(stream => {
                const source = audioCtx.createMediaStreamSource(stream);
                source.connect(comp);
            })
            .catch(error => console.error('Error accessing display media:', error));

        return () => {
            audioCtx.close();
        };
    }, [isCapturing]);

    const handleCompressorChange = (param, value) => {
        if (compressor) {
            compressor[param].value = parseFloat(value);
        }
    };

    const handleEqChange = (index, value) => {
        if (eqFilters[index]) {
            eqFilters[index].gain.value = parseFloat(value);
        }
    };

    return (
        <div>
            <h1>Live Audio EQ and Compressor</h1>
            <button onClick={() => setIsCapturing(true)}>Start Capture</button>
            <div>
                <h2>Compressor Settings</h2>
                <label>
                    Threshold:
                    <input type="range" min="-100" max="0" defaultValue="0" onChange={(e) => handleCompressorChange('threshold', e.target.value)} />
                </label>
                <label>
                    Ratio:
                    <input type="range" min="1" max="20" defaultValue="4" onChange={(e) => handleCompressorChange('ratio', e.target.value)} />
                </label>
                <label>
                    Attack:
                    <input type="range" min="0" max="1" step="0.01" defaultValue="0.1" onChange={(e) => handleCompressorChange('attack', e.target.value)} />
                </label>
                <label>
                    Release:
                    <input type="range" min="0" max="1" step="0.01" defaultValue="0.25" onChange={(e) => handleCompressorChange('release', e.target.value)} />
                </label>
            </div>
            <div>
                <h2>Equalizer Settings</h2>
                {eqFilters.map((filter, index) => (
                    <div key={index}>
                        <label>
                            {eqFrequencies[index]} Hz:
                            <input type="range" min="-30" max="30" defaultValue="0" onChange={(e) => handleEqChange(index, e.target.value)} />
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;
