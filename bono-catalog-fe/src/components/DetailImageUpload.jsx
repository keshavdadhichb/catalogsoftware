import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'

function DetailImageUpload({
    fabricCloseup,
    stitchingDetail,
    onFabricCloseupChange,
    onStitchingDetailChange
}) {
    const onDropFabric = useCallback((acceptedFiles) => {
        if (acceptedFiles[0]) {
            onFabricCloseupChange(acceptedFiles[0])
        }
    }, [onFabricCloseupChange])

    const onDropStitching = useCallback((acceptedFiles) => {
        if (acceptedFiles[0]) {
            onStitchingDetailChange(acceptedFiles[0])
        }
    }, [onStitchingDetailChange])

    const { getRootProps: getFabricProps, getInputProps: getFabricInputProps, isDragActive: isFabricDrag } = useDropzone({
        onDrop: onDropFabric,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
        maxFiles: 1
    })

    const { getRootProps: getStitchingProps, getInputProps: getStitchingInputProps, isDragActive: isStitchingDrag } = useDropzone({
        onDrop: onDropStitching,
        accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
        maxFiles: 1
    })

    return (
        <div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}>
                Upload closeup images for Fabric Detail pages (optional)
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Fabric Closeup */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        Fabric Texture Closeup
                    </label>
                    <div
                        {...getFabricProps()}
                        className={`dropzone ${isFabricDrag ? 'active' : ''}`}
                        style={{ padding: '1rem', minHeight: '120px' }}
                    >
                        <input {...getFabricInputProps()} />
                        {fabricCloseup ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <img
                                    src={URL.createObjectURL(fabricCloseup)}
                                    alt="Fabric"
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        objectFit: 'cover',
                                        borderRadius: '8px'
                                    }}
                                />
                                <span style={{ fontSize: '0.875rem' }}>{fabricCloseup.name}</span>
                            </div>
                        ) : (
                            <>
                                <div className="dropzone-icon">🧵</div>
                                <p style={{ margin: 0 }}>Drop fabric texture image</p>
                            </>
                        )}
                    </div>
                </div>

                {/* Stitching Detail */}
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        Stitching/Collar Detail
                    </label>
                    <div
                        {...getStitchingProps()}
                        className={`dropzone ${isStitchingDrag ? 'active' : ''}`}
                        style={{ padding: '1rem', minHeight: '120px' }}
                    >
                        <input {...getStitchingInputProps()} />
                        {stitchingDetail ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <img
                                    src={URL.createObjectURL(stitchingDetail)}
                                    alt="Stitching"
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        objectFit: 'cover',
                                        borderRadius: '8px'
                                    }}
                                />
                                <span style={{ fontSize: '0.875rem' }}>{stitchingDetail.name}</span>
                            </div>
                        ) : (
                            <>
                                <div className="dropzone-icon">✂️</div>
                                <p style={{ margin: 0 }}>Drop stitching closeup</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DetailImageUpload
