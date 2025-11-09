import React, { useState, useEffect } from 'react';

const ProgressBar = ({ userId, initialProgress }) => {

    const [progress, setProgress] = useState(initialProgress || []);

    // Only needed for refresh/reload scenarios
    useEffect(() => {
        if (!initialProgress?.length) {
            window.api.getChapterProgress(userId).then(setProgress);
        }
    }, [userId]);

    let totalProgress = 0;
    for (const chapter of progress) {
        totalProgress += chapter.progress;
    }
    const averageProgress = totalProgress / progress.length;

    return (<div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
            width: '50%',
            backgroundColor: '#f0f0f0',
            borderRadius: '12px',
            padding: '4px',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
        }}>
            <div style={{
                width: `${averageProgress}%`,
                height: '16px',
                backgroundColor: averageProgress === 100 ? '#10B981' : '#3B82F6', // Green when complete
                borderRadius: '8px',
                transition: 'width 0.5s ease-out, background-color 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '8px',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold'
            }}>
                {Math.round(averageProgress)}%
            </div>
        </div>
    </div>
    );
};

export default ProgressBar;