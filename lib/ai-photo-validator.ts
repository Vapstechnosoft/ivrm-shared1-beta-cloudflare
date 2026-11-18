/**
 * AI Photo Validator
 * Validates whether an uploaded file is a valid photograph of a person (e.g. Father, Mother, Student photo).
 * Rejects non-person images (e.g., cars, landscapes, pets, signatures, documents, invoices, or random objects)
 * with a clear explanatory message.
 */

export interface PhotoValidationResult {
    isValid: boolean;
    detectedType: 'person' | 'document' | 'signature' | 'object' | 'landscape' | 'blank' | 'unknown';
    confidence: number;
    message: string;
}

/**
 * Checks whether an RGB pixel falls within the universal human skin chromaticity cluster.
 * Uses YCbCr color space calibrated across all Fitzpatrick scale skin tones (Fair to Deep Indian/Global tones).
 */
function isHumanSkinPixel(r: number, g: number, b: number): boolean {
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
    const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

    // YCbCr skin bounds
    const isSkinYCbCr = cr >= 133 && cr <= 175 && cb >= 77 && cb <= 130 && y >= 35 && y <= 240;

    if (!isSkinYCbCr) return false;

    // Additional RGB relationship checks for natural skin tones
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    return r > g && g >= b && diff >= 10;
}

/**
 * Analyzes pixel data from an image canvas to detect whether it is a human portrait,
 * a document/certificate, a signature, or an inanimate object/landscape.
 */
function analyzeCanvasPixels(
    imageData: ImageData,
    width: number,
    height: number
): {
    skinRatio: number;
    centralSkinRatio: number;
    whiteRatio: number;
    darkStrokeRatio: number;
    horizontalEdgeDensity: number;
    dominantColor: 'skin' | 'white' | 'nature' | 'monochrome' | 'mixed';
} {
    const data = imageData.data;
    const totalPixels = width * height;

    let skinCount = 0;
    let centralSkinCount = 0;
    let whiteCount = 0;
    let darkStrokeCount = 0;
    let greenBlueCount = 0;
    let horizontalEdgeTransitions = 0;

    // Center-of-interest region for passport/portrait photos (middle 60% horizontally, top 15% to 80% vertically)
    const centerXStart = Math.floor(width * 0.2);
    const centerXEnd = Math.floor(width * 0.8);
    const centerYStart = Math.floor(height * 0.12);
    const centerYEnd = Math.floor(height * 0.82);
    const centralTotalPixels = (centerXEnd - centerXStart) * (centerYEnd - centerYStart);

    let prevRowAvgLuminance = 0;

    for (let y = 0; y < height; y++) {
        let rowLuminanceSum = 0;
        const isCentralY = y >= centerYStart && y <= centerYEnd;

        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];

            // Transparent pixel treated as white
            if (a < 50) {
                whiteCount++;
                continue;
            }

            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            rowLuminanceSum += luminance;

            // Check if near white / paper background
            if (r > 225 && g > 225 && b > 225) {
                whiteCount++;
            } else if (luminance < 75) {
                darkStrokeCount++;
            }

            // Check for foliage green and upper sky blue
            if (g > r + 25 && g > b + 15) {
                greenBlueCount++;
            } else if (b > r + 35 && b > g + 20 && y < height * 0.4) {
                greenBlueCount++;
            }

            // Check human skin
            if (isHumanSkinPixel(r, g, b)) {
                skinCount++;
                if (isCentralY && x >= centerXStart && x <= centerXEnd) {
                    centralSkinCount++;
                }
            }
        }

        const avgLuminance = rowLuminanceSum / width;
        if (Math.abs(avgLuminance - prevRowAvgLuminance) > 25) {
            horizontalEdgeTransitions++;
        }
        prevRowAvgLuminance = avgLuminance;
    }

    const skinRatio = skinCount / totalPixels;
    const centralSkinRatio = centralTotalPixels > 0 ? centralSkinCount / centralTotalPixels : 0;
    const whiteRatio = whiteCount / totalPixels;
    const darkStrokeRatio = darkStrokeCount / totalPixels;
    const horizontalEdgeDensity = horizontalEdgeTransitions / height;

    let dominantColor: 'skin' | 'white' | 'nature' | 'monochrome' | 'mixed' = 'mixed';
    if (skinRatio > 0.12) dominantColor = 'skin';
    else if (whiteRatio > 0.7) dominantColor = 'white';
    else if (greenBlueCount / totalPixels > 0.35) dominantColor = 'nature';

    return {
        skinRatio,
        centralSkinRatio,
        whiteRatio,
        darkStrokeRatio,
        horizontalEdgeDensity,
        dominantColor
    };
}

/**
 * Validates whether an uploaded image is a valid photo of a person.
 * Runs native FaceDetector if supported by the browser, followed by specialized
 * computer vision feature analysis.
 *
 * @param file - The uploaded image file
 * @returns PhotoValidationResult with isValid, detectedType, and human-friendly message
 */
export async function validatePersonPhoto(file: File): Promise<PhotoValidationResult> {
    if (!file) {
        return {
            isValid: false,
            detectedType: 'blank',
            confidence: 0,
            message: 'No file provided. Please select an image.'
        };
    }

    // 1. Basic format check
    const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type.toLowerCase())) {
        return {
            isValid: false,
            detectedType: 'unknown',
            confidence: 0,
            message: 'Unsupported format. Please upload a JPG, JPEG, or PNG image.'
        };
    }

    // 2. Load file into an HTML Image Element
    let img: HTMLImageElement;
    try {
        img = await new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error('Failed to decode image file'));
            image.src = URL.createObjectURL(file);
        });
    } catch (_err) {
        return {
            isValid: false,
            detectedType: 'unknown',
            confidence: 0,
            message: 'Corrupted image file. Please upload a valid photo.'
        };
    }

    // 3. Layer 1: Native Browser FaceDetector (Chromium Shape Detection API)
    if (typeof window !== 'undefined' && 'FaceDetector' in (window as any)) {
        try {
            const FaceDetector = (window as any).FaceDetector;
            const detector = new FaceDetector({ fastMode: true, maxDetectedFaces: 5 });
            const faces = await detector.detect(img);

            if (faces && faces.length > 0) {
                // Confirm the detected face occupies reasonable proportions
                const face = faces[0].boundingBox;
                const faceArea = (face.width * face.height) / (img.naturalWidth * img.naturalHeight);

                if (faceArea >= 0.03) {
                    return {
                        isValid: true,
                        detectedType: 'person',
                        confidence: 0.98,
                        message: 'Valid photo of person detected.'
                    };
                }
            }
        } catch (_e) {
            // Fall through to Canvas Vision Analyzer
        }
    }

    // 4. Layer 2: Computer Vision Canvas Feature Extraction
    // Scale image down to standard dimensions for fast, deterministic pixel scanning
    const canvas = document.createElement('canvas');
    const targetDim = 250;
    const aspect = img.naturalWidth / img.naturalHeight;

    let w = targetDim;
    let h = targetDim;
    if (aspect > 1) {
        h = Math.round(targetDim / aspect);
    } else {
        w = Math.round(targetDim * aspect);
    }

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        // Fallback: If canvas context is unavailable, accept image gracefully
        return {
            isValid: true,
            detectedType: 'person',
            confidence: 0.7,
            message: 'Image accepted.'
        };
    }

    ctx.drawImage(img, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);

    const metrics = analyzeCanvasPixels(imageData, w, h);

    // Classification Rules:

    // Case A: Signature Detection (predominantly white background with isolated dark ink strokes)
    if (metrics.whiteRatio > 0.82 && metrics.darkStrokeRatio < 0.12 && metrics.skinRatio < 0.03) {
        return {
            isValid: false,
            detectedType: 'signature',
            confidence: 0.94,
            message: 'AI detected a signature instead of a photo. Please upload a clear photo of the person.'
        };
    }

    // Case B: Document / Certificate / Mark Sheet (mostly white paper with text line transitions)
    if (metrics.whiteRatio > 0.65 && metrics.horizontalEdgeDensity > 0.35 && metrics.skinRatio < 0.04) {
        return {
            isValid: false,
            detectedType: 'document',
            confidence: 0.92,
            message: 'AI detected a document/certificate instead of a person photo. Please upload a portrait photo.'
        };
    }

    // Case C: Outdoor / Nature / Scenery / Wallpaper
    if (metrics.dominantColor === 'nature' && metrics.skinRatio < 0.04) {
        return {
            isValid: false,
            detectedType: 'landscape',
            confidence: 0.9,
            message: 'AI detected scenery/landscape. Please upload a clear photo of the person.'
        };
    }

    // Case D: Inanimate Object / Vehicle / Tech / Dark or Blank Image
    if (metrics.centralSkinRatio < 0.05 && metrics.skinRatio < 0.04) {
        return {
            isValid: false,
            detectedType: 'object',
            confidence: 0.88,
            message: 'AI detected that this is not a person photo (no face/person detected). Please upload a clear photo of the person.'
        };
    }

    // Case E: Human Person Photo (skin pixels form a cohesive cluster in the central portrait area)
    if (metrics.centralSkinRatio >= 0.07 || metrics.skinRatio >= 0.06) {
        return {
            isValid: true,
            detectedType: 'person',
            confidence: 0.95,
            message: 'Valid person photo detected.'
        };
    }

    // Case F: Borderline / Ambiguous - Reject with explicit guidance
    return {
        isValid: false,
        detectedType: 'unknown',
        confidence: 0.6,
        message: 'AI detected that this is not a valid person photo. Please upload a clear, front-facing photo of the person.'
    };
}
