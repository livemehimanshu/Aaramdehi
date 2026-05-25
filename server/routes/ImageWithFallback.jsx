import React, { useState } from 'react';

const ImageWithFallback = ({ src, alt, className, ...props }) => {
    const [error, setError] = useState(false);
    const fallbackImage = "https://placehold.co/400x400/111827/4b5563?text=Image+Not+Found";

    const handleError = () => {
        if (!error) {
            setError(true);
        }
    };

    return (
        <img
            src={error ? fallbackImage : (src || fallbackImage)}
            alt={alt}
            className={className}
            onError={handleError}
            {...props}
        />
    );
};

export default ImageWithFallback;