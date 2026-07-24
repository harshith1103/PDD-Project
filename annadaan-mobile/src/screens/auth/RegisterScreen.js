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

const ROLES = [
  { key: 'donor', label: 'Donor', icon: '🤲' },
  { key: 'volunteer', label: 'Volunteer', icon: '🚴' },
  { key: 'recipient', label: 'Recipient', icon: '🏠' },
];

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('donor');
  const [locationName, setLocationName] = useState('');
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
    if (!name.trim()) errs.name = 'Name is required';
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    const data = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      address: locationName.trim() || 'Bangalore',
      location: {
        lat: 12.9716,
        lng: 77.5946,
      },
    };
    const result = await register(data);
    setLoading(false);
    if (!result.success) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the food redistribution network</Text>

          <View style={styles.form}>
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              error={errors.name}
            />
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
              placeholder="At least 6 characters"
              secureTextEntry
              error={errors.password}
            />

            {/* Role Selector */}
            <Text style={styles.label}>I want to join as</Text>
            <View style={styles.roleRow}>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.roleBtn, role === r.key && styles.roleBtnActive]}
                  onPress={() => setRole(r.key)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.roleIcon}>{r.icon}</Text>
                  <Text style={[styles.roleLabel, role === r.key && styles.roleLabelActive]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Location / Address Manual Entry */}
            <Input
              label="Location / City Address"
              value={locationName}
              onChangeText={setLocationName}
              placeholder="e.g. Koramangala, Bangalore"
            />

            <Button
              title="Register"
              onPress={handleRegister}
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

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.footerLink}>Login</Text>
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
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  form: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  roleRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  roleBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryFaded,
  },
  roleIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  roleLabelActive: {
    color: Colors.primary,
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

export default RegisterScreen;

