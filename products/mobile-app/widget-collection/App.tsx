# Widget Collection App
# React Native 小组件合集
# 小七团队开发

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

// 小组件类型
const WIDGET_TYPES = {
  WEATHER: 'weather',
  CLOCK: 'clock',
  TODO: 'todo',
  QUOTE: 'quote',
  CURRENCY: 'currency',
  CALENDAR: 'calendar',
  BATTERY: 'battery',
  STEPS: 'steps',
};

// 主应用
export default function WidgetApp() {
  const [activeWidgets, setActiveWidgets] = useState([]);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await AsyncStorage.getItem('widgetSettings');
    if (data) {
      setSettings(JSON.parse(data));
      setActiveWidgets(JSON.parse(data).activeWidgets || []);
    }
  };

  const saveSettings = async (newSettings) => {
    await AsyncStorage.setItem('widgetSettings', JSON.stringify(newSettings));
    setSettings(newSettings);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎛️ Widget Collection</Text>
        <Text style={styles.subtitle}>自定义你的主屏幕</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>已激活的小组件</Text>
        {activeWidgets.length === 0 ? (
          <Text style={styles.emptyText}>还没有激活的小组件</Text>
        ) : (
          activeWidgets.map(widget => (
            <ActiveWidgetCard 
              key={widget.type} 
              widget={widget}
              onRemove={() => removeWidget(widget.type)}
            />
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>添加小组件</Text>
        <WidgetCard 
          icon="🌤️"
          title="天气"
          description="实时天气和预报"
          onPress={() => addWidget(WIDGET_TYPES.WEATHER)}
          disabled={activeWidgets.some(w => w.type === WIDGET_TYPES.WEATHER)}
        />
        
        <WidgetCard 
          icon="🕐"
          title="时钟"
          description="数字/模拟时钟"
          onPress={() => addWidget(WIDGET_TYPES.CLOCK)}
          disabled={activeWidgets.some(w => w.type === WIDGET_TYPES.CLOCK)}
        />
        
        <WidgetCard 
          icon="✅"
          title="待办"
          description="快速查看待办事项"
          onPress={() => addWidget(WIDGET_TYPES.TODO)}
          disabled={activeWidgets.some(w => w.type === WIDGET_TYPES.TODO)}
        />
        
        <WidgetCard 
          icon="💬"
          title="每日名言"
          description="激励你的每日名言"
          onPress={() => addWidget(WIDGET_TYPES.QUOTE)}
          disabled={activeWidgets.some(w => w.type === WIDGET_TYPES.QUOTE)}
        />
        
        <WidgetCard 
          icon="💱"
          title="汇率"
          description="实时汇率转换"
          onPress={() => addWidget(WIDGET_TYPES.CURRENCY)}
          disabled={activeWidgets.some(w =㺎 w.type === WIDGET_TYPES.CURRENCY)}
        />
        
        <WidgetCard 
          icon="📅"
          title="日历"
          description="月视图和事件"
          onPress={() => addWidget(WIDGET_TYPES.CALENDAR)}
          disabled={activeWidgets.some(w => w.type === WIDGET_TYPES.CALENDAR)}
        />
        
        <WidgetCard 
          icon="🔋"
          title="电池"
          description="电池状态和预估"
          onPress={() => addWidget(WIDGET_TYPES.BATTERY)}
          disabled={activeWidgets.some(w => w.type === WIDGET_TYPES.BATTERY)}
        />
        
        <WidgetCard 
          icon="👟"
          title="步数"
          description="今日步数统计"
          onPress={() => addWidget(WIDGET_TYPES.STEPS)}
          disabled={activeWidgets.some(w => w.type === WIDGET_TYPES.STEPS)}
        />
      </View>

      <View style={styles.proSection}>
        <Text style={styles.proTitle}>⭐ Pro 版本</Text>
        <Text style={styles.proFeatures}>
          解锁更多小组件:\n
          • 股票行情 📈\n
          • 加密货币 💰\n
          • 航班追踪 ✈️\n
          • 快递查询 📦\n
          • 更多主题 🎨\n
          \n
          仅需 €2.99/月
        </Text>
        <TouchableOpacity style={styles.upgradeButton}>
          <Text style={styles.upgradeButtonText}>升级到 Pro</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  function addWidget(type) {
    if (activeWidgets.length >= 3) {
      Alert.alert(
        '达到上限',
        '免费版最多3个小组件。升级到Pro可使用无限小组件！',
        [
          { text: '取消', style: 'cancel' },
          { text: '升级', onPress: () => console.log('Upgrade') }
        ]
      );
      return;
    }

    const newWidget = {
      type,
      settings: getDefaultSettings(type),
    };

    const newActiveWidgets = [...activeWidgets, newWidget];
    setActiveWidgets(newActiveWidgets);
    saveSettings({ ...settings, activeWidgets: newActiveWidgets });
  }

  function removeWidget(type) {
    const newActiveWidgets = activeWidgets.filter(w => w.type !== type);
    setActiveWidgets(newActiveWidgets);
    saveSettings({ ...settings, activeWidgets: newActiveWidgets });
  }

  function getDefaultSettings(type) {
    const defaults = {
      [WIDGET_TYPES.WEATHER]: { unit: 'celsius', location: 'auto' },
      [WIDGET_TYPES.CLOCK]: { format: '24h', style: 'digital' },
      [WIDGET_TYPES.TODO]: { maxItems: 5 },
      [WIDGET_TYPES.QUOTE]: { category: 'motivation' },
      [WIDGET_TYPES.CURRENCY]: { from: 'USD', to: 'EUR' },
      [WIDGET_TYPES.CALENDAR]: { view: 'month' },
      [WIDGET_TYPES.BATTERY]: { showPercentage: true },
      [WIDGET_TYPES.STEPS]: { goal: 10000 },
    };
    return defaults[type] || {};
  }
}

// 小组件卡片
function WidgetCard({ icon, title, description, onPress, disabled }) {
  return (
    <TouchableOpacity 
      style={[styles.widgetCard, disabled && styles.disabledCard]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.widgetIcon}>{icon}</Text>
      <View style={styles.widgetInfo}>
        <Text style={styles.widgetTitle}>{title}</Text>
        <Text style={styles.widgetDesc}>{description}</Text>
      </View>
      {disabled && <Text style={styles.addedBadge}>已添加</Text>}
    </TouchableOpacity>
  );
}

// 已激活小组件卡片
function ActiveWidgetCard({ widget, onRemove }) {
  const widgetInfo = {
    [WIDGET_TYPES.WEATHER]: { icon: '🌤️', title: '天气' },
    [WIDGET_TYPES.CLOCK]: { icon: '🕐', title: '时钟' },
    [WIDGET_TYPES.TODO]: { icon: '✅', title: '待办' },
    [WIDGET_TYPES.QUOTE]: { icon: '💬', title: '名言' },
    [WIDGET_TYPES.CURRENCY]: { icon: '💱', title: '汇率' },
    [WIDGET_TYPES.CALENDAR]: { icon: '📅', title: '日历' },
    [WIDGET_TYPES.BATTERY]: { icon: '🔋', title: '电池' },
    [WIDGET_TYPES.STEPS]: { icon: '👟', title: '步数' },
  };

  const info = widgetInfo[widget.type] || { icon: '❓', title: '未知' };

  return (
    <View style={styles.activeCard}>
      <Text style={styles.activeIcon}>{info.icon}</Text>
      <Text style={styles.activeTitle}>{info.title}</Text>
      <TouchableOpacity onPress={onRemove} style={styles.removeButton}>
        <Text style={styles.removeButtonText}>删除</Text>
      </TouchableOpacity>
    </View>
  );
}

// 样式
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 24,
    backgroundColor: '#6366F1',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
  },
  widgetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledCard: {
    opacity: 0.5,
  },
  widgetIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  widgetInfo: {
    flex: 1,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  widgetDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  addedBadge: {
    backgroundColor: '#10B981',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  activeTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#4338CA',
  },
  removeButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  proSection: {
    margin: 16,
    padding: 24,
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
  },
  proTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 12,
  },
  proFeatures: {
    fontSize: 16,
    color: '#C7D2FE',
    lineHeight: 24,
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: '#FFD700',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#1E1B4B',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

// 定价
const PRICING = {
  free: {
    price: 0,
    maxWidgets: 3,
    features: ['基础小组件', '标准主题']
  },
  pro: {
    price: 2.99,
    period: 'month',
    maxWidgets: 999,
    features: ['所有小组件', '高级主题', '自定义设置', '无广告']
  }
};

// 收入预测
const REVENUE_PROJECTION = {
  monthlyUsers: 1000,
  conversionRate: 0.05,  // 5%
  monthlyRevenue: 1000 * 0.05 * 2.99,
  yearlyRevenue: 1000 * 0.05 * 2.99 * 12
};
