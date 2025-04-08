import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Alert,
  Switch,
  ScrollView,
  Platform,
  Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  const [apiUrl, setApiUrl] = useState('');
  const [showLinkPreview, setShowLinkPreview] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedApiUrl = await AsyncStorage.getItem('apiUrl');
      if (savedApiUrl) {
        setApiUrl(savedApiUrl);
      }
      
      const savedShowLinkPreview = await AsyncStorage.getItem('showLinkPreview');
      if (savedShowLinkPreview !== null) {
        setShowLinkPreview(savedShowLinkPreview === 'true');
      }
      
      const savedAutoRefresh = await AsyncStorage.getItem('autoRefresh');
      if (savedAutoRefresh !== null) {
        setAutoRefresh(savedAutoRefresh === 'true');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    }
  };

  const saveSettings = async () => {
    // Basic validation for API URL
    if (!apiUrl.trim()) {
      Alert.alert('Error', 'API URL cannot be empty');
      return;
    }
    
    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      Alert.alert('Error', 'API URL must start with http:// or https://');
      return;
    }
    
    setIsSaving(true);
    
    try {
      await AsyncStorage.setItem('apiUrl', apiUrl);
      await AsyncStorage.setItem('showLinkPreview', String(showLinkPreview));
      await AsyncStorage.setItem('autoRefresh', String(autoRefresh));
      
      Alert.alert(
        'Success', 
        'Settings saved successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              setApiUrl('');
              setShowLinkPreview(true);
              setAutoRefresh(false);
              Alert.alert('Success', 'Settings reset to default');
            } catch (error) {
              console.error('Error resetting settings:', error);
              Alert.alert('Error', 'Failed to reset settings');
            }
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Server Configuration</Text>
          
          <Text style={styles.label}>API URL</Text>
          <TextInput
            style={styles.input}
            value={apiUrl}
            onChangeText={setApiUrl}
            placeholder="https://your-ip-logger.com/api"
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.hint}>
            Enter the base URL of your IP logger API
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Show Link Preview</Text>
            <Switch
              value={showLinkPreview}
              onValueChange={setShowLinkPreview}
              trackColor={{ false: '#444', true: '#FF0000' }}
              thumbColor={showLinkPreview ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={() => {
                Alert.alert(
                  'Feature Locked',
                  'Dark mode is currently the only available theme'
                );
              }}
              trackColor={{ false: '#444', true: '#FF0000' }}
              thumbColor={darkMode ? '#FFFFFF' : '#f4f3f4'}
              disabled={true}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Auto Refresh (Every 30s)</Text>
            <Switch
              value={autoRefresh}
              onValueChange={setAutoRefresh}
              trackColor={{ false: '#444', true: '#FF0000' }}
              thumbColor={autoRefresh ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Doxxer v1.0.0{'\n'}
            Made by 『ꪶ𝒁𝑬𝑭𝑰𝑹𝜣̸͢ꫂ 𝒜𝓵ℯ𝓂ℴ𝓷
          </Text>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={resetSettings}
          >
            <Text style={styles.resetButtonText}>Reset Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.saveButton, isSaving && styles.savingButton]}
            onPress={saveSettings}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: '#FF0000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#DDDDDD',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#252525',
    borderRadius: 4,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  hint: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingLabel: {
    fontSize: 16,
    color: '#DDDDDD',
  },
  aboutText: {
    color: '#DDDDDD',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  resetButton: {
    backgroundColor: '#333',
    marginRight: 8,
  },
  resetButtonText: {
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#FF0000',
    marginLeft: 8,
  },
  savingButton: {
    backgroundColor: '#AA0000',
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default SettingsScreen;