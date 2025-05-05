import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: string;
  nextBillingDate: string;
  reminderDays: number;
}

export default function Home() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await axios.get('http://localhost:3000/api/subscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSubscriptions(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('authToken');
        router.replace('/(auth)/login');
      } else {
        Alert.alert('Error', 'Failed to fetch subscriptions');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    router.replace('/(auth)/login');
  };

  const renderSubscription = ({ item }: { item: Subscription }) => (
    <TouchableOpacity 
      style={styles.subscriptionCard}
      onPress={() => router.push(`/(app)/subscription/${item.id}`)}
    >
      <View style={styles.subscriptionHeader}>
        <Text style={styles.subscriptionName}>{item.name}</Text>
        <Text style={styles.subscriptionAmount}>${item.amount}</Text>
      </View>
      
      <View style={styles.subscriptionDetails}>
        <Text style={styles.detailText}>
          Billing Cycle: {item.billingCycle}
        </Text>
        <Text style={styles.detailText}>
          Next Billing: {new Date(item.nextBillingDate).toLocaleDateString()}
        </Text>
        <Text style={styles.detailText}>
          Reminder: {item.reminderDays} days before
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Subscriptions</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading subscriptions...</Text>
      ) : (
        <>
          <FlatList
            data={subscriptions}
            renderItem={renderSubscription}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No subscriptions yet. Add your first subscription!
              </Text>
            }
          />

          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/(app)/subscription/new')}
          >
            <Text style={styles.addButtonText}>Add Subscription</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  list: {
    padding: 20,
  },
  subscriptionCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subscriptionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subscriptionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  subscriptionDetails: {
    gap: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#007AFF',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 