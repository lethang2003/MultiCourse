import React, { useEffect, useState } from 'react';
import { Spin, Typography, Progress } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';


const { Title, Text } = Typography;

const FullScreenLoader = ({ 
  message = "Loading...", 
  description = "Please wait while we load your content",
  showProgress = true,
  minDuration = 2000, // Minimum time to show loader in milliseconds (set to 2 seconds)
  onComplete = () => {}
}) => {


  const [progress, setProgress] = useState(0);
  const [displayLoader, setDisplayLoader] = useState(true);
  
  // Custom loading icon
  const antIcon = (
    <LoadingOutlined 
      style={{ fontSize: 60, color: '#1890ff' }} 
      spin 
    />
  );

  // Simulate loading progress with fixed duration of 2 seconds
  useEffect(() => {
    const startTime = Date.now();
    let progressInterval;
    let completionTimer;
    
    // Only show progress bar if requested
    if (showProgress) {
      // Calculate proper increment to reach 100% in exactly 2 seconds
      // with 10 updates per second (200ms interval)
      progressInterval = setInterval(() => {
        setProgress(prevProgress => {
          // For a 2-second duration with 200ms intervals, we need ~10% increment per interval
          const increment = 8 + Math.random() * 4; // 8-12% per interval
          
          const newProgress = prevProgress + increment;
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 200);
      
      // Force completion at exactly 2 seconds
      setTimeout(() => {
        setProgress(100);
      }, 2000);
    } else {
      // If no progress bar, still need to trigger completion
      setProgress(100);
    }
    
    // Handle completion
    const handleCompletion = () => {
      // Ensure minimum display time
      const elapsedTime = Date.now() - startTime;
      
      if (elapsedTime < minDuration) {
        completionTimer = setTimeout(() => {
          setDisplayLoader(false);
          onComplete();
        }, minDuration - elapsedTime);
      } else {
        setDisplayLoader(false);
        onComplete();
      }
      
      if (progressInterval) clearInterval(progressInterval);
    };
    
    // Check if progress has reached 100%
    const checkComplete = setInterval(() => {
      if (progress >= 99.9) {
        clearInterval(checkComplete);
        handleCompletion();
      }
    }, 100);
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (completionTimer) clearTimeout(completionTimer);
      clearInterval(checkComplete);
    };
  }, [minDuration, onComplete, progress, showProgress]);

  if (!displayLoader) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center `}
      style={{ backdropFilter: 'blur(4px)' }}
    >
      <div className="flex flex-col items-center max-w-md mx-auto p-8">
        {/* Main spinner */}
        <Spin indicator={antIcon} className="mb-8" />
        
        {/* Message */}
        <Title 
          level={3} 
          className={`text-center mb-2 `}
        >
          {message}
        </Title>
        
        {/* Description */}
        <Text 
          className={`text-center mb-8 `}
        >
          {description}
        </Text>
        
        {/* Progress bar */}
        {showProgress && (
          <div className="w-full max-w-sm">
            <Progress 
              percent={Math.round(progress)} 
              status="active" 
              strokeColor={{ 
                from: '#108ee9', 
                to: '#87d068' 
              }}
            />
          </div>
        )}
        
        {/* Animated dots */}
        <div className="flex space-x-2 mt-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full animate-bounce `}
              style={{ 
                animationDuration: '1s',
                animationDelay: `${i * 0.15}s` 
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FullScreenLoader;