import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { predictImage } from '../services/api';

export default function ResultScreen({ route, navigation }) {
  const { imageUri, modelName } = route.params;
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    analyzePlant();
  }, []);

  const analyzePlant = async () => {
    setLoading(true);
    setError(null);

    try {
      const predictionResult = await predictImage(imageUri, modelName);
      setResult(predictionResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatusColor = (prediction) => {
    const className = prediction?.class?.toLowerCase() || '';
    if (className.includes('healthy')) {
      return '#4CAF50';
    }
    return '#f44336';
  };

  const getHealthStatusText = (prediction) => {
    const className = prediction?.class?.toLowerCase() || '';
    if (className.includes('healthy')) {
      return 'Healthy Plant';
    }
    return 'Disease Detected';
  };

  const getRecommendation = (prediction) => {
    const className = prediction?.class?.toLowerCase() || '';
    
    if (className.includes('healthy')) {
      return 'Your plant appears healthy! Continue regular care and monitoring.';
    }
    
    const recommendations = {
      'rust': 'Apply fungicide treatment. Remove affected leaves. Improve air circulation.',
      'blight': 'Remove infected parts immediately. Apply copper-based fungicide. Avoid overhead watering.',
      'spot': 'Prune affected areas. Apply appropriate fungicide. Ensure proper plant spacing.',
      'scab': 'Remove fallen leaves. Apply fungicide during growing season. Ensure good drainage.',
      'rot': 'Improve drainage. Reduce watering. Remove affected parts. Apply fungicide.',
      'mold': 'Increase ventilation. Reduce humidity. Apply fungicide. Remove affected leaves.',
      'virus': 'Remove infected plants. Control insect vectors. Disinfect tools.',
    };
    
    for (const [disease, recommendation] of Object.entries(recommendations)) {
      if (className.includes(disease)) {
        return recommendation;
      }
    }
    
    return 'Consult with a local agricultural expert for specific treatment recommendations.';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Analyzing plant image...</Text>
        <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>!</Text>
        <Text style={styles.errorTitle}>Analysis Failed</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={analyzePlant}>
          <Text style={styles.retryButtonText}>Retry Analysis</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f5f7fa', '#ffffff']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Preview */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>

        {/* Main Result Card */}
        <View style={styles.resultCard}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getHealthStatusColor(result.prediction) },
            ]}
          >
            <Text style={styles.statusText}>
              {getHealthStatusText(result.prediction)}
            </Text>
          </View>

          <Text style={styles.diseaseTitle}>
            {result.prediction.formatted_name}
          </Text>

          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>Confidence</Text>
            <View style={styles.confidenceBarContainer}>
              <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={[
                  styles.confidenceBar,
                  { width: `${(result.prediction.confidence * 100).toFixed(0)}%` },
                ]}
              />
            </View>
            <Text style={styles.confidenceValue}>
              {(result.prediction.confidence * 100).toFixed(1)}%
            </Text>
          </View>

          <View style={styles.modelBadge}>
            <Text style={styles.modelBadgeText}>
              Analyzed by {result.prediction.model_used}
            </Text>
          </View>
        </View>

        {/* Recommendation Card */}
        <View style={styles.recommendationCard}>
          <Text style={styles.recommendationTitle}>Recommendation</Text>
          <Text style={styles.recommendationText}>
            {getRecommendation(result.prediction)}
          </Text>
        </View>

        {/* Top Predictions */}
        {result.top_predictions && result.top_predictions.length > 1 && (
          <View style={styles.topPredictionsCard}>
            <Text style={styles.topPredictionsTitle}>
              Other Possibilities
            </Text>
            {result.top_predictions.slice(1, 5).map((pred, index) => (
              <View key={index} style={styles.predictionItem}>
                <View style={styles.predictionRank}>
                  <Text style={styles.predictionRankText}>{index + 2}</Text>
                </View>
                <View style={styles.predictionContent}>
                  <Text style={styles.predictionName}>{pred.formatted_name}</Text>
                  <View style={styles.miniConfidenceBar}>
                    <View
                      style={[
                        styles.miniConfidenceFill,
                        { width: `${(pred.confidence * 100).toFixed(0)}%` },
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.predictionConfidence}>
                  {(pred.confidence * 100).toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>← Analyze Another</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#7f8c8d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  backButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f5f7fa',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  diseaseTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 20,
  },
  confidenceContainer: {
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
    fontWeight: '600',
  },
  confidenceBarContainer: {
    height: 12,
    backgroundColor: '#ecf0f1',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  confidenceBar: {
    height: '100%',
    borderRadius: 6,
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
    textAlign: 'right',
  },
  modelBadge: {
    backgroundColor: '#f5f7fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  modelBadgeText: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  recommendationCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 15,
    color: '#1b5e20',
    lineHeight: 22,
  },
  topPredictionsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  topPredictionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  predictionRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  predictionRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7f8c8d',
  },
  predictionContent: {
    flex: 1,
    marginRight: 12,
  },
  predictionName: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    marginBottom: 6,
  },
  miniConfidenceBar: {
    height: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniConfidenceFill: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 3,
  },
  predictionConfidence: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
    minWidth: 50,
    textAlign: 'right',
  },
  actionButtonsContainer: {
    marginBottom: 20,
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
