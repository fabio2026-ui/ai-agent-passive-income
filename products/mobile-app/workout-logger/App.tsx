# React Native Fitness App - Simple Workout Logger
# 小七团队开发

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';

// 类型定义
interface Workout {
  id: string;
  name: string;
  date: string;
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

interface Set {
  id: string;
  reps: number;
  weight: number;
}

// 主应用组件
export default function App() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const data = await AsyncStorage.getItem('workouts');
      if (data) {
        setWorkouts(JSON.parse(data));
      }
    } catch (error) {
      console.error('加载失败:', error);
    }
  };

  const saveWorkout = async (workout: Workout) => {
    const newWorkouts = [workout, ...workouts];
    setWorkouts(newWorkouts);
    await AsyncStorage.setItem('workouts', JSON.stringify(newWorkouts));
  };

  const deleteWorkout = async (id: string) => {
    const newWorkouts = workouts.filter(w => w.id !== id);
    setWorkouts(newWorkouts);
    await AsyncStorage.setItem('workouts', JSON.stringify(newWorkouts));
  };

  // 首页
  const HomeView = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💪 Workout Logger</Text>
        <Text style={styles.headerSubtitle}>记录每一次进步</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{workouts.length}</Text>
          <Text style={styles.statLabel}>总训练</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {workouts.reduce((acc, w) => acc + w.exercises.length, 0)}
          </Text>
          <Text style={styles.statLabel}>总动作</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {workouts.length > 0 
              ? Math.round(workouts.reduce((acc, w) => 
                  acc + w.exercises.reduce((eAcc, e) => 
                    eAcc + e.sets.reduce((sAcc, s) => sAcc + s.weight * s.reps, 0), 0), 0) / 1000)
              : 0}
          </Text>
          <Text style={styles.statLabel}>总吨数(kg)</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>+ 开始新训练</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>最近训练</Text>
      <FlatList
        data={workouts.slice(0, 5)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.workoutCard}>
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutName}>{item.name}</Text>
              <Text style={styles.workoutDate}>{item.date}</Text>
            </View>
            <Text style={styles.workoutExercises}>
              {item.exercises.length} 个动作 · {item.exercises.reduce((acc, e) => acc + e.sets.length, 0)} 组
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>还没有训练记录，开始你的第一次训练吧！</Text>
        }
      />
    </View>
  );

  // 添加训练模态框
  const AddWorkoutModal = () => {
    const [workoutName, setWorkoutName] = useState('');
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [currentExercise, setCurrentExercise] = useState('');

    const addExercise = () => {
      if (!currentExercise) return;
      const newExercise: Exercise = {
        id: Date.now().toString(),
        name: currentExercise,
        sets: [{ id: '1', reps: 10, weight: 0 }],
      };
      setExercises([...exercises, newExercise]);
      setCurrentExercise('');
    };

    const addSet = (exerciseId: string) => {
      setExercises(exercises.map(e => {
        if (e.id === exerciseId) {
          return {
            ...e,
            sets: [...e.sets, { id: Date.now().toString(), reps: 10, weight: 0 }],
          };
        }
        return e;
      }));
    };

    const updateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: number) => {
      setExercises(exercises.map(e => {
        if (e.id === exerciseId) {
          return {
            ...e,
            sets: e.sets.map(s => s.id === setId ? { ...s, [field]: value } : s),
          };
        }
        return e;
      }));
    };

    const save = () => {
      if (!workoutName || exercises.length === 0) return;
      const workout: Workout = {
        id: Date.now().toString(),
        name: workoutName,
        date: new Date().toLocaleDateString('zh-CN'),
        exercises,
      };
      saveWorkout(workout);
      setShowAddModal(false);
      setWorkoutName('');
      setExercises([]);
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📝 新训练</Text>
            
            <TextInput
              style={styles.input}
              placeholder="训练名称 (例如: 胸肌训练)"
              value={workoutName}
              onChangeText={setWorkoutName}
            />

            <Text style={styles.label}>添加动作</Text>
            <View style={styles.addExerciseRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="动作名称 (例如: 卧推)"
                value={currentExercise}
                onChangeText={setCurrentExercise}
              />
              <TouchableOpacity style={styles.smallButton} onPress={addExercise}>
                <Text style={styles.smallButtonText}>添加</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={exercises}
              keyExtractor={(item) => item.id}
              renderItem={({ item: exercise }) => (
                <View style={styles.exerciseItem}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  {exercise.sets.map((set, index) => (
                    <View key={set.id} style={styles.setRow}>
                      <Text style={styles.setLabel}>组{index + 1}</Text>
                      <TextInput
                        style={styles.smallInput}
                        placeholder="重量"
                        keyboardType="numeric"
                        value={set.weight.toString()}
                        onChangeText={(v) => updateSet(exercise.id, set.id, 'weight', parseInt(v) || 0)}
                      />
                      <Text style={styles.inputLabel}>kg</Text>
                      <TextInput
                        style={styles.smallInput}
                        placeholder="次数"
                        keyboardType="numeric"
                        value={set.reps.toString()}
                        onChangeText={(v) => updateSet(exercise.id, set.id, 'reps', parseInt(v) || 0)}
                      />
                      <Text style={styles.inputLabel}>次</Text>
                    </View>
                  ))}
                  <TouchableOpacity 
                    style={styles.addSetButton}
                    onPress={() => addSet(exercise.id)}
                  >
                    <Text style={styles.addSetButtonText}>+ 添加组</Text>
                  </TouchableOpacity>
                </View>
              )}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={save}
              >
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <HomeView />
      <AddWorkoutModal />
    </SafeAreaView>
  );
}

// 样式
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  workoutCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  workoutDate: {
    fontSize: 14,
    color: '#999',
  },
  workoutExercises: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a1a1a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  addExerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  smallButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  exerciseItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  setLabel: {
    width: 40,
    fontSize: 14,
    color: '#666',
  },
  smallInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    width: 60,
    textAlign: 'center',
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  addSetButton: {
    backgroundColor: '#34C759',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  addSetButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f2f2f2',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
