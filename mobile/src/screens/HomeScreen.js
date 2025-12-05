import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { checkHealth, getModels } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [selectedModel, setSelectedModel] = useState('efficientnetb0');
  const [models, setModels] = useState([]);
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    setLoading(true);
    
    // Request permissions
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and media library permissions are required to use this app.'
      );
    }
    
    // Check backend health
    try {
      await checkHealth();
      setIsServerOnline(true);
      
      // Fetch available models
      const modelsData = await getModels();
      setModels(modelsData.models || []);
    } catch (error) {
      setIsServerOnline(false);
      Alert.alert(
        'Server Offline',
        'Cannot connect to the backend server. Please ensure the backend is running.'
      );
    }
    
    setLoading(false);
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        navigation.navigate('Result', {
          imageUri: result.assets[0].uri,
          modelName: selectedModel,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo: ' + error.message);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        navigation.navigate('Result', {
          imageUri: result.assets[0].uri,
          modelName: selectedModel,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f5f7fa', '#ffffff']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Plant Disease</Text>
          <Text style={styles.titleHighlight}>Detection</Text>
          <Text style={styles.subtitle}>
            Identify plant diseases instantly using AI
          </Text>
        </View>

        {/* Server Status */}
        <View style={styles.statusCard}>
          <View style={[styles.statusDot, isServerOnline ? styles.online : styles.offline]} />
          <Text style={styles.statusText}>
            Server: {isServerOnline ? 'Online' : 'Offline'}
          </Text>
          <TouchableOpacity onPress={initializeApp} style={styles.refreshButton}>
            <Text style={styles.refreshText}>↻</Text>
          </TouchableOpacity>
        </View>

        {/* Model Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Model</Text>
          <View style={styles.modelContainer}>
            {models.map((model) => (
              <TouchableOpacity
                key={model.id}
                style={[
                  styles.modelCard,
                  selectedModel === model.id && styles.modelCardSelected,
                ]}
                onPress={() => setSelectedModel(model.id)}
                disabled={!isServerOnline}
              >
                <View style={styles.modelHeader}>
                  <View
                    style={[
                      styles.radioButton,
                      selectedModel === model.id && styles.radioButtonSelected,
                    ]}
                  >
                    {selectedModel === model.id && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text
                    style={[
                      styles.modelName,
                      selectedModel === model.id && styles.modelNameSelected,
                    ]}
                  >
                    {model.name}
                  </Text>
                </View>
                <Text style={styles.modelInfo}>{model.classes} disease classes</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Capture Image</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, !isServerOnline && styles.disabledButton]}
            onPress={takePhoto}
            disabled={!isServerOnline}
          >
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonIcon}>📷</Text>
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, !isServerOnline && styles.disabledButton]}
            onPress={pickImage}
            disabled={!isServerOnline}
          >
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonIcon}>🖼️</Text>
              <Text style={styles.actionButtonText}>Choose from Gallery</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 How it works</Text>
          <Text style={styles.infoText}>
            1. Select an AI model{'\n'}
            2. Take a photo or choose from gallery{'\n'}
            3. Get instant disease identification{'\n'}
            4. View detailed results and recommendations
          </Text>
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
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#2c3e50',
  },
  titleHighlight: {
    fontSize: 36,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 4,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#f44336',
  },
  statusText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '600',
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f7fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshText: {
    fontSize: 20,
    color: '#2c3e50',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 16,
  },
  modelContainer: {
    gap: 12,
  },
  modelCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  modelCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#f1f8f4',
  },
  modelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#4CAF50',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  modelName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  modelNameSelected: {
    color: '#4CAF50',
  },
  modelInfo: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 36,
  },
  actionButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  actionButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff3e0',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e65100',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#5d4037',
    lineHeight: 24,
  },
});
