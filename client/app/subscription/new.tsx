import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function NewSubscription() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [nextBillingDate, setNextBillingDate] = useState(new Date());
  const [reminderDays, setReminderDays] = useState('3');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async () => {
    if (!name || !amount || !billingCycle || !reminderDays) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      await axios.post(
        'http://localhost:3000/api/subscriptions',
        {
          name,
          amount: parseFloat(amount),
          billingCycle,
          nextBillingDate: nextBillingDate.toISOString(),
          reminderDays: parseInt(reminderDays),
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      router.back();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create subscription'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Subscription</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Subscription Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Netflix, Spotify"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Billing Cycle</Text>
        <View style={styles.cycleContainer}>
          {['monthly', 'quarterly', 'yearly'].map((cycle) => (
            <TouchableOpacity
              key={cycle}
              style={[
                styles.cycleButton,
                billingCycle === cycle && styles.cycleButtonActive,
              ]}
              onPress={() => setBillingCycle(cycle)}
            >
              <Text
                style={[
                  styles.cycleButtonText,
                  billingCycle === cycle && styles.cycleButtonTextActive,
                ]}
              >
                {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Next Billing Date</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {nextBillingDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={nextBillingDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setNextBillingDate(selectedDate);
              }
            }}
          />
        )}

        <Text style={styles.label}>Reminder Days Before</Text>
        <TextInput
          style={styles.input}
          placeholder="3"
          value={reminderDays}
          onChangeText={setReminderDays}
          keyboardType="number-pad"
        />

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Creating...' : 'Create Subscription'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    padding: 20,
    gap: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cycleContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  cycleButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  cycleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  cycleButtonText: {
    fontSize: 16,
    color: '#333',
  },
  cycleButtonTextActive: {
    color: 'white',
  },
  dateButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 