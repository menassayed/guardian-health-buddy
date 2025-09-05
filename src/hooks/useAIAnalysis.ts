import { useState, useEffect } from 'react';

interface HealthData {
  heartRate: number;
  spO2: number;
  respiration: number;
  timestamp: number;
}

interface AIAnalysis {
  riskLevel: 'low' | 'medium' | 'high';
  insights: string[];
  recommendations: string[];
}

export const useAIAnalysis = (healthData: HealthData | null) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!healthData) return;

    const analyzeHealthData = async () => {
      setLoading(true);
      try {
        // Send to your existing AI model API endpoint
        const response = await fetch('/api/ai-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(healthData),
        });

        if (response.ok) {
          const result = await response.json();
          setAnalysis(result);
        }
      } catch (error) {
        console.error('AI Analysis error:', error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce API calls
    const timeoutId = setTimeout(analyzeHealthData, 1000);
    return () => clearTimeout(timeoutId);
  }, [healthData]);

  return { analysis, loading };
};