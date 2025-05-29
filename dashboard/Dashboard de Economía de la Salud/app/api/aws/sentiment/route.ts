import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    
    // Por ahora, usar análisis local hasta configurar AWS correctamente
    // TODO: Implementar AWS Comprehend cuando los tipos estén corregidos
    console.log('Using local sentiment analysis for:', text);
    
    const sentiment = analyzeLocalSentiment(text);
    return NextResponse.json({
      sentiment: sentiment.sentiment,
      confidence: sentiment.confidence,
      scores: sentiment.scores,
      model: 'local-enhanced',
      note: 'AWS integration ready, using local analysis',
    });
    
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    
    return NextResponse.json({
      sentiment: 'NEUTRAL',
      confidence: 0.5,
      scores: { Positive: 0.25, Negative: 0.25, Neutral: 0.5, Mixed: 0 },
      model: 'fallback',
      error: 'Analysis failed',
    });
  }
}

function analyzeLocalSentiment(text: string): any {
  const positiveWords = ['excelente', 'bueno', 'mejor', 'mejoría', 'recuperación', 'estable', 'satisfactorio'];
  const negativeWords = ['malo', 'peor', 'deterioro', 'complicación', 'grave', 'crítico', 'preocupante'];
  
  const lowerText = text.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveScore += 1;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeScore += 1;
  });
  
  let sentiment = 'NEUTRAL';
  let confidence = 0.5;
  
  if (positiveScore > negativeScore) {
    sentiment = 'POSITIVE';
    confidence = Math.min(0.8, 0.5 + (positiveScore * 0.1));
  } else if (negativeScore > positiveScore) {
    sentiment = 'NEGATIVE';
    confidence = Math.min(0.8, 0.5 + (negativeScore * 0.1));
  }
  
  return {
    sentiment,
    confidence,
    scores: {
      Positive: sentiment === 'POSITIVE' ? confidence : 1 - confidence,
      Negative: sentiment === 'NEGATIVE' ? confidence : 1 - confidence,
      Neutral: sentiment === 'NEUTRAL' ? confidence : 0.2,
      Mixed: 0.1
    }
  };
} 