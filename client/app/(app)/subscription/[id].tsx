import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';

interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: string;
  nextBillingDate: string;
  reminderDays: number;
}

export default function SubscriptionDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState('');
  const [nextBillingDate, setNextBillingDate] = useState(new Date());
  const [reminderDays, setReminderDays] = useState('');

  useEffect(() => {
    fetchSubscription();
  }, [id]);

  const fetchSubscription = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await axios.get(`http://localhost:3000/api/subscriptions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSubscription(response.data);
      // Initialize form state
      setName(response.data.name);
      setAmount(response.data.amount.toString());
      setBillingCycle(response.data.billingCycle);
      setNextBillingDate(new Date(response.data.nextBillingDate));
      setReminderDays(response.data.reminderDays.toString());
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('authToken');
        router.replace('/(auth)/login');
      } else {
        Alert.alert('Error', 'Failed to fetch subscription details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
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

      await axios.patch(
        `http://localhost:3000/api/subscriptions/${id}`,
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

      setEditing(false);
      fetchSubscription();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update subscription'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Subscription',
      'Are you sure you want to delete this subscription?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');
              if (!token) {
                router.replace('/(auth)/login');
                return;
              }

              await axios.delete(`http://localhost:3000/api/subscriptions/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });

              router.back();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to delete subscription'
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading subscription details...</Text>
      </View>
    );
  }

  if (!subscription) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Subscription not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Subscription Details</Text>
        <View style={styles.headerButtons}>
          {editing ? (
            <>
              <TouchableOpacity
                style={[styles.headerButton, styles.cancelButton]}
                onPress={() => {
                  setEditing(false);
                  fetchSubscription();
                }}
              >
                <Text style={styles.headerButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerButton, styles.saveButton]}
                onPress={handleUpdate}
                disabled={loading}
              >
                <Text style={styles.headerButtonText}>
                  {loading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.headerButton, styles.editButton]}
                onPress={() => setEditing(true)}
              >
                <Text style={styles.headerButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Text style={styles.headerButtonText}>Delete</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Subscription name"
            />
          ) : (
            <Text style={styles.value}>{subscription.name}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Amount</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
          ) : (
            <Text style={styles.value}>${subscription.amount}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Billing Cycle</Text>
          {editing ? (
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
          ) : (
            <Text style={styles.value}>
              {subscription.billingCycle.charAt(0).toUpperCase() +
                subscription.billingCycle.slice(1)}
            </Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Next Billing Date</Text>
          {editing ? (
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {nextBillingDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.value}>
              {new Date(subscription.nextBillingDate).toLocaleDateString()}
            </Text>
          )}
        </View>

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

        <View style={styles.field}>
          <Text style={styles.label}>Reminder Days Before</Text>
          {editing ? (
            <TextInput
              style={styles.input}
              value={reminderDays}
              onChangeText={setReminderDays}
              keyboardType="number-pad"
              placeholder="3"
            />
          ) : (
            <Text style={styles.value}>{subscription.reminderDays} days</Text>
          )}
        </View>
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
    marginBottom: 15,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  headerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  field: {
    gap: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  value: {
    fontSize: 18,
    color: '#666',
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
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#FF3B30',
  },
}); 