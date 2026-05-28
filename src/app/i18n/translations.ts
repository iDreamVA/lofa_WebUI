export type Language = 'th' | 'en';

export interface Translations {
  appTitle: string;
  subtitle: string;
  liveStatus: string;
  bodyTemperature: string;
  caloriesBurned: string;
  duration: string;
  activityLevel: string;
  temperatureChart: string;
  gyroscopeMovement: string;
  realTime3DMovement: string;
  aiAnalysis: string;
  aiInsights: string;
  footerText: string;
  nav: {
    onboarding: string;
    dashboard: string;
    realtime: string;
    sensors: string;
  };
  onboarding: {
    title: string;
    subtitle: string;
    yourName: string;
    namePlaceholder: string;
    height: string;
    weight: string;
    age: string;
    gender: string;
    male: string;
    female: string;
    other: string;
    calculate: string;
    cm: string;
    kg: string;
    years: string;
  };
  bmi: {
    title: string;
    score: string;
    underweight: string;
    normal: string;
    overweight: string;
    obese: string;
    category: string;
  };
  posture: {
    title: string;
    analysis: string;
    normal: string;
    warning: string;
    needsAttention: string;
  };
  history: {
    title: string;
    weightTrend: string;
    lastWeek: string;
  };
  sensors: {
    title: string;
    subtitle: string;
    workspace: string;
    groupNodes: string;
    individualNodes: string;
    armSensors: string;
    backSensors: string;
    legSensors: string;
    temperature: string;
    gyroscope: string;
    heartRate: string;
    humidity: string;
    airQuality: string;
    dragInstruction: string;
    connected: string;
    disconnected: string;
    noSensorsConnected: string;
    noSensorsDesc: string;
    goToSensorPage: string;
  };
  unit: {
    celsius: string;
    kcal: string;
    min: string;
  };
  trend: {
    up: string;
    down: string;
    stable: string;
    onPace: string;
  };
  activityLevels: {
    high: string;
    medium: string;
    low: string;
  };
  insights: {
    excellentCadence: {
      title: string;
      description: string;
    };
    forwardLean: {
      title: string;
      description: string;
    };
    temperatureRising: {
      title: string;
      description: string;
    };
    balancedFootStrike: {
      title: string;
      description: string;
    };
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: 'LOFA',
    subtitle: 'Real-time Running Performance Dashboard',
    liveStatus: 'LIVE',
    nav: {
      onboarding: 'Profile',
      dashboard: 'Dashboard',
      realtime: 'Live Data',
      sensors: 'Sensors',
    },
    onboarding: {
      title: 'Welcome to LOFA',
      subtitle: 'Let\'s get to know you better',
      yourName: 'Your Name',
      namePlaceholder: 'Enter your name',
      height: 'Height',
      weight: 'Weight',
      age: 'Age',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      calculate: 'Calculate BMI',
      cm: 'cm',
      kg: 'kg',
      years: 'years',
    },
    bmi: {
      title: 'Body Mass Index',
      score: 'BMI Score',
      underweight: 'Underweight',
      normal: 'Normal',
      overweight: 'Overweight',
      obese: 'Obese',
      category: 'Category',
    },
    posture: {
      title: 'Posture Analysis',
      analysis: 'Real-time Posture Monitoring',
      normal: 'Normal',
      warning: 'Warning',
      needsAttention: 'Needs Attention',
    },
    history: {
      title: 'Weight History',
      weightTrend: 'Weight Trend',
      lastWeek: 'Last 7 Days',
    },
    sensors: {
      title: 'Sensor Configuration',
      subtitle: 'Drag and connect your sensors',
      workspace: 'Workspace',
      groupNodes: 'Sensor Groups',
      individualNodes: 'Individual Sensors',
      armSensors: 'Arm Sensors',
      backSensors: 'Back Sensors',
      legSensors: 'Leg Sensors',
      temperature: 'Temperature',
      gyroscope: 'Movement',
      heartRate: 'Heart Rate',
      humidity: 'Humidity',
      airQuality: 'Air Quality',
      dragInstruction: 'Drag sensors from the sidebar to the workspace',
      connected: 'Connected',
      disconnected: 'Disconnected',
      noSensorsConnected: 'No Sensors Connected',
      noSensorsDesc: 'Add and connect sensors on the Sensor Configuration page to see live data here.',
      goToSensorPage: 'Configure Sensors',
    },
    bodyTemperature: 'Temperature',
    caloriesBurned: 'Calories Burned',
    duration: 'Duration',
    activityLevel: 'Activity Level',
    temperatureChart: 'Temperature Chart',
    gyroscopeMovement: 'Accelerometer (g)',
    realTime3DMovement: 'Real-time 3D Movement',
    aiAnalysis: 'AI Analysis',
    aiInsights: 'AI Insights',
    footerText: 'Data updates every 2 seconds • AI-powered running form analysis',
    unit: {
      celsius: '°C',
      kcal: 'kcal',
      min: 'min',
    },
    trend: {
      up: 'Up',
      down: 'Down',
      stable: 'Stable',
      onPace: 'On pace',
    },
    activityLevels: {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
    insights: {
      excellentCadence: {
        title: 'Excellent Cadence',
        description: 'Your stride rate is optimal at 180 steps per minute, maintaining ideal running efficiency.',
      },
      forwardLean: {
        title: 'Slight Forward Lean',
        description: 'Body angle is 12° forward. Try to maintain a more upright posture to reduce lower back strain.',
      },
      temperatureRising: {
        title: 'Temperature Rising Normally',
        description: 'Core temperature increase is within expected range. Stay hydrated for optimal performance.',
      },
      balancedFootStrike: {
        title: 'Balanced Foot Strike',
        description: 'Left-right symmetry is excellent at 98%, indicating proper form and reduced injury risk.',
      },
    },
  },
  th: {
    appTitle: 'LOFA',
    subtitle: 'แดชบอร์ดติดตามผลการวิ่งแบบเรียลไทม์',
    liveStatus: 'ถ่ายทอดสด',
    nav: {
      onboarding: 'ข้อมูลส่วนตัว',
      dashboard: 'แดชบอร์ด',
      realtime: 'ข้อมูลสด',
      sensors: 'เซ็นเซอร์',
    },
    onboarding: {
      title: 'ยินดีต้อนรับสู่ LOFA',
      subtitle: 'มาทำความรู้จักคุณกันดีกว่า',
      yourName: 'ชื่อของคุณ',
      namePlaceholder: 'กรอกชื่อของคุณ',
      height: 'ส่วนสูง',
      weight: 'น้ำหนัก',
      age: 'อายุ',
      gender: 'เพศ',
      male: 'ชาย',
      female: 'หญิง',
      other: 'อื่นๆ',
      calculate: 'คำนวณ BMI',
      cm: 'ซม.',
      kg: 'กก.',
      years: 'ปี',
    },
    bmi: {
      title: 'ดัชนีมวลกาย',
      score: 'คะแนน BMI',
      underweight: 'น้ำหนักน้อย',
      normal: 'ปกติ',
      overweight: 'น้ำหนักเกิน',
      obese: 'อ้วน',
      category: 'หมวดหมู่',
    },
    posture: {
      title: 'การวิเคราะห์ท่าทาง',
      analysis: 'การตรวจสอบท่าทางแบบเรียลไทม์',
      normal: 'ปกติ',
      warning: 'เตือน',
      needsAttention: 'ต้องใส่ใจ',
    },
    history: {
      title: 'ประวัติน้ำหนัก',
      weightTrend: 'แนวโน้มน้ำหนัก',
      lastWeek: '7 วันที่ผ่านมา',
    },
    sensors: {
      title: 'การตั้งค่าเซ็นเซอร์',
      subtitle: 'ลากและเชื่อมต่อเซ็นเซอร์ของคุณ',
      workspace: 'พื้นที่ทำงาน',
      groupNodes: 'กลุ่มเซ็นเซอร์',
      individualNodes: 'เซ็นเซอร์แต่ละตัว',
      armSensors: 'เซ็นเซอร์แขน',
      backSensors: 'เซ็นเซอร์หลัง',
      legSensors: 'เซ็นเซอร์ขา',
      temperature: 'อุณหภูมิ',
      gyroscope: 'เคลื่อนไหว',
      heartRate: 'อัตราการเต้นหัวใจ',
      humidity: 'ความชื้น',
      airQuality: 'คุณภาพอากาศ',
      dragInstruction: 'ลากเซ็นเซอร์จากแถบด้านข้างไปยังพื้นที่ทำงาน',
      connected: 'เชื่อมต่อแล้ว',
      disconnected: 'ยังไม่ได้เชื่อมต่อ',
      noSensorsConnected: 'ยังไม่มีเซ็นเซอร์ที่เชื่อมต่อ',
      noSensorsDesc: 'เพิ่มและเชื่อมต่อเซ็นเซอร์ที่หน้าการตั้งค่าเซ็นเซอร์เพื่อดูข้อมูลแบบเรียลไทม์',
      goToSensorPage: 'ตั้งค่าเซ็นเซอร์',
    },
    bodyTemperature: 'อุณหภูมิร่างกาย',
    caloriesBurned: 'แคลอรี่ที่เผาผลาญ',
    duration: 'ระยะเวลา',
    activityLevel: 'ระดับกิจกรรม',
    temperatureChart: 'กราฟอุณหภูมิ',
    gyroscopeMovement: 'ความเร่ง (g)',
    realTime3DMovement: 'การเคลื่อนไหว 3 มิติแบบเรียลไทม์',
    aiAnalysis: 'การวิเคราะห์ AI',
    aiInsights: 'ข้อมูลเชิงลึกจาก AI',
    footerText: 'อัปเดตข้อมูลทุก 2 วินาที • การวิเคราะห์ท่าวิ่งด้วย AI',
    unit: {
      celsius: '°C',
      kcal: 'แคล',
      min: 'นาที',
    },
    trend: {
      up: 'เพิ่มขึ้น',
      down: 'ลดลง',
      stable: 'คงที่',
      onPace: 'ตามเป้า',
    },
    activityLevels: {
      high: 'สูง',
      medium: 'ปานกลาง',
      low: 'ต่ำ',
    },
    insights: {
      excellentCadence: {
        title: 'จังหวะก้าวยอดเยี่ยม',
        description: 'อัตราก้าวของคุณอยู่ในระดับที่เหมาะสมที่ 180 ก้าวต่อนาที รักษาประสิทธิภาพการวิ่งที่ดีที่สุด',
      },
      forwardLean: {
        title: 'ลำตัวเอนไปข้างหน้าเล็กน้อย',
        description: 'มุมร่างกายเอนไปข้างหน้า 12 องศา พยายามรักษาท่าตัวตรงมากขึ้นเพื่อลดความเครียดที่หลังส่วนล่าง',
      },
      temperatureRising: {
        title: 'อุณหภูมิเพิ่มขึ้นตามปกติ',
        description: 'อุณหภูมิแกนกลางเพิ่มขึ้นอยู่ในช่วงที่คาดไว้ ดื่มน้ำให้เพียงพอเพื่อประสิทธิภาพที่ดีที่สุด',
      },
      balancedFootStrike: {
        title: 'การลงเท้าสมดุล',
        description: 'ความสมมาตรซ้าย-ขวายอดเยี่ยมที่ 98% บ่งชี้ถึงท่าทางที่ถูกต้องและความเสี่ยงการบาดเจ็บที่ลดลง',
      },
    },
  },
};
