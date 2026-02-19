import { useState, useRef, useCallback, useEffect, useContext } from 'react';
import { FaCamera, FaUpload, FaTimes, FaSpinner, FaSearch, FaExchangeAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContextType';

interface VisualSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SearchResult {
    product: {
        _id: string;
        name: string;
        price: number;
        images: string[];
        category: string;
        description?: string;
    };
    similarity: number;
}

const VisualSearch = ({ isOpen, onClose }: VisualSearchProps) => {
    const [mode, setMode] = useState<'select' | 'camera' | 'preview'>('select');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const cartContext = useContext(CartContext);

    // Clean up camera stream when component unmounts or closes
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    // Stop camera when modal closes
    useEffect(() => {
        if (!isOpen && stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
            setMode('select');
            setCapturedImage(null);
            setResults([]);
            setError(null);
        }
    }, [isOpen, stream]);

    const startCamera = async () => {
        try {
            setError(null);
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: 640, height: 480 }
            });
            setStream(mediaStream);
            setMode('camera');

            // Wait for video element, then assign stream
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            }, 100);
        } catch (err) {
            console.error('Camera error:', err);
            setError('Could not access camera. Please check permissions or try uploading an image.');
        }
    };

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                const imageData = canvas.toDataURL('image/jpeg', 0.8);
                setCapturedImage(imageData);
                stopCamera();
                setMode('preview');
            }
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setCapturedImage(result);
                setMode('preview');
            };
            reader.readAsDataURL(file);
        }
    };

    const performSearch = async () => {
        if (!capturedImage) return;

        setIsSearching(true);
        setError(null);
        setResults([]);

        try {
            const response = await fetch('http://localhost:5000/product/visual-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: capturedImage,
                    topN: 10
                }),
            });

            const data = await response.json();

            if (data.success) {
                setResults(data.results);
                if (data.results.length === 0) {
                    setError('No similar products found. Try a different image.');
                }
            } else {
                setError(data.message || 'Search failed. Please try again.');
            }
        } catch (err) {
            console.error('Visual search error:', err);
            setError('Could not connect to search service. Please ensure the server is running.');
        } finally {
            setIsSearching(false);
        }
    };

    const resetSearch = () => {
        setCapturedImage(null);
        setResults([]);
        setError(null);
        setMode('select');
    };

    // Add product to cart and go to checkout
    const buyProduct = (product: SearchResult['product']) => {
        if (!cartContext) return;

        // Add the product to cart
        const cartItem = {
            _id: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
            images: product.images || [],
        };

        cartContext.addToCart(cartItem);

        // Close modal and navigate to buy-now page
        onClose();
        navigate('/buy-now');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FaCamera className="text-white text-xl" />
                        <h2 className="text-white font-semibold text-lg">Visual Search</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <FaTimes className="text-xl" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {/* Mode Selection */}
                    {mode === 'select' && (
                        <div className="space-y-6">
                            <p className="text-gray-600 text-center">
                                Take a photo or upload an image to find similar products
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={startCamera}
                                    className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-teal-300 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all group"
                                >
                                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                                        <FaCamera className="text-2xl text-teal-600" />
                                    </div>
                                    <span className="font-medium text-gray-700">Take Photo</span>
                                </button>

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-orange-300 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group"
                                >
                                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                                        <FaUpload className="text-2xl text-orange-600" />
                                    </div>
                                    <span className="font-medium text-gray-700">Upload Image</span>
                                </button>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </div>
                    )}

                    {/* Camera View */}
                    {mode === 'camera' && (
                        <div className="space-y-4">
                            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 border-4 border-white/30 rounded-xl pointer-events-none" />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        stopCamera();
                                        setMode('select');
                                    }}
                                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={capturePhoto}
                                    className="flex-1 py-3 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FaCamera /> Capture
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Preview & Search */}
                    {mode === 'preview' && (
                        <div className="space-y-4">
                            {/* Image Preview */}
                            <div className="relative rounded-xl overflow-hidden bg-gray-100 aspect-video">
                                {capturedImage && (
                                    <img
                                        src={capturedImage}
                                        alt="Captured"
                                        className="w-full h-full object-contain"
                                    />
                                )}
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Action Buttons */}
                            {results.length === 0 && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={resetSearch}
                                        className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaExchangeAlt /> New Image
                                    </button>
                                    <button
                                        onClick={performSearch}
                                        disabled={isSearching}
                                        className="flex-1 py-3 px-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSearching ? (
                                            <>
                                                <FaSpinner className="animate-spin" /> Searching...
                                            </>
                                        ) : (
                                            <>
                                                <FaSearch /> Find Similar
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Results */}
                            {results.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-800">
                                            Similar Products ({results.length})
                                        </h3>
                                        <button
                                            onClick={resetSearch}
                                            className="text-sm text-teal-600 hover:text-teal-700"
                                        >
                                            Search Again
                                        </button>
                                    </div>

                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                        {results.map((result) => (
                                            <div
                                                key={result.product._id}
                                                onClick={() => buyProduct(result.product)}
                                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-teal-50 cursor-pointer transition-colors border-2 border-transparent hover:border-teal-300"
                                            >
                                                <img
                                                    src={result.product.images[0]}
                                                    alt={result.product.name}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-800 truncate">
                                                        {result.product.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        {result.product.category}
                                                    </p>
                                                    <p className="text-teal-600 font-semibold">
                                                        Rs. {result.product.price.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="inline-block px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                                                        {Math.round(result.similarity * 100)}% match
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Hidden canvas for capturing */}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
};

export default VisualSearch;
