import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Colors from '../../utils/colors';
import api, { getBaseUrl } from '../../api/axios';
import { setCustomApiUrl, getCustomApiUrl } from '../../utils/storage';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Server Settings Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadServerUrl();
  }, []);

  const loadServerUrl = async () => {
    const activeUrl = await getBaseUrl();
    setCurrentUrl(activeUrl);
    const custom = await getCustomApiUrl();
    setInputUrl(custom || activeUrl);
  };

  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    const result = await login(email.trim().toLowerCase(), password);
    setLoading(false);
    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: result.message,
      });
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      let target = inputUrl.trim().replace(/\/$/, '');
      if (!target.endsWith('/api')) target += '/api';
      
      const response = await api.get('/health', { baseURL: target, timeout: 5000 });
      if (response.data?.success) {
        Toast.show({
          type: 'success',
          text1: 'Server Connected! ✅',
          text2: response.data.message || 'Annadaan API is online.',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Connection Warning',
          text2: 'Server responded but status was unexpected.',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Connection Failed ❌',
        text2: err.message || 'Could not reach server at this IP/URL.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveServerUrl = async () => {
    let target = inputUrl.trim();
    if (target.length > 0 && !target.startsWith('http://') && !target.startsWith('https://')) {
      target = `http://${target}`;
    }
    await setCustomApiUrl(target);
    await loadServerUrl();
    setModalVisible(false);
    Toast.show({
      type: 'success',
      text1: 'Server IP Saved',
      text2: `Updated API endpoint to ${target || 'default'}`,
    });
  };

  const handleResetServerUrl = async () => {
    await setCustomApiUrl(null);
    await loadServerUrl();
    setModalVisible(false);
    Toast.show({
      type: 'info',
      text1: 'Reset to Default',
      text2: 'Restored automatic server IP detection.',
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo area */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🙏</Text>
            </View>
            <Text style={styles.appName}>Annadaan Connect</Text>
            <Text style={styles.tagline}>Connecting surplus to need</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              error={errors.email}
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              error={errors.password}
            />
            <Button
              title="Login"
              onPress={handleLogin}
              loading={loading}
              style={{ marginTop: 8 }}
            />
          </View>

          {/* Server Settings Link */}
          <TouchableOpacity
            style={styles.serverSettingsBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.serverSettingsText}>
              ⚙️ Server Endpoint: <Text style={styles.serverUrlHighlight}>{currentUrl || 'Detecting...'}</Text>
            </Text>
          </TouchableOpacity>

          {/* Register link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Server Settings Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚙️ Server IP / Endpoint</Text>
            <Text style={styles.modalSub}>
              Enter your backend server IP address or URL (e.g. http://172.25.39.66:5000):
            </Text>

            <Input
              label="Server URL or IP"
              value={inputUrl}
              onChangeText={setInputUrl}
              placeholder="http://172.25.39.66:5000"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalBtnGroup}>
              <Button
                title={testing ? 'Testing...' : '⚡ Test Connection'}
                onPress={handleTestConnection}
                loading={testing}
                variant="secondary"
                style={{ flex: 1, marginRight: 6 }}
              />
              <Button
                title="Save"
                onPress={handleSaveServerUrl}
                style={{ flex: 1, marginLeft: 6 }}
              />
            </View>

            <TouchableOpacity style={styles.resetBtn} onPress={handleResetServerUrl}>
              <Text style={styles.resetBtnText}>Reset to Default (172.25.39.66)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primaryFaded,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoEmoji: {
    fontSize: 42,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  form: {
    marginBottom: 16,
  },
  serverSettingsBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 20,
  },
  serverSettingsText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  serverUrlHighlight: {
    color: Colors.primary,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  modalSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  modalBtnGroup: {
    flexDirection: 'row',
    marginTop: 12,
  },
  resetBtn: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 8,
  },
  resetBtnText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  closeBtn: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 8,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
  },
});

export default LoginScreen;

