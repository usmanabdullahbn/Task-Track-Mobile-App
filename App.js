import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useState } from "react";
import { Platform, SafeAreaView, StatusBar, StyleSheet } from "react-native";

// Screens
import WorkOrderDetail from "./src/order/WorkOrder";
// import DashboardScreen from "./src/screens/Dashboard";
import HomeScreen from "./src/screens/Home"; // renamed import
import LoginScreen from "./src/screens/Login";
import Profile from "./src/screens/Profile";
import RegisterScreen from "./src/screens/RegisterScreen";
// import Tasks from "./src/screens/Tasks";
import AllTasks from "./src/screens/AllTasks";
import DueTodayTasks from "./src/tasks/DueToday";
import InProgressTasks from "./src/tasks/InProgress";
import OnHoldTasks from "./src/tasks/OnHold";
import OpenTasks from "./src/tasks/Open";
import PastDueTasks from "./src/tasks/PastDue";
import PendingTasks from "./src/tasks/PendingTasks";
import TaskDetail from "./src/order/Task";
import TaskVerification from "./src/task/TaskVerification";
import TaskStart from "./src/task/TaskStart";
import TaskCompelete from "./src/task/TaskCompelete";

// Navigators
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator(); // renamed
const TasksStack = createNativeStackNavigator();

// ✅ Auth Stack
function AuthStack({ setIsLoggedIn }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />}
      </Stack.Screen>
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ✅ Home Stack (nested inside tab)
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />

      <HomeStack.Screen name="AllTasks" component={AllTasks} />
      <HomeStack.Screen name="PendingTasks" component={PendingTasks} />
      <HomeStack.Screen
        name="InProgressTasks"
        component={InProgressTasks}
      />
      <HomeStack.Screen name="OnHoldTasks" component={OnHoldTasks} />
      <HomeStack.Screen name="OpenTasks" component={OpenTasks} />
      <HomeStack.Screen name="DueTodayTasks" component={DueTodayTasks} />
      <HomeStack.Screen name="PastDueTasks" component={PastDueTasks} />

      <HomeStack.Screen name="WorkOrder" component={WorkOrderDetail} />
      <HomeStack.Screen name="TaskDetail" component={TaskDetail} />
    </HomeStack.Navigator>
  );
}

function TaskStackScreen() {
  return (
    <TasksStack.Navigator screenOptions={{ headerShown: false }}>
      {/* <TasksStack.Screen name="TasksMain" component={Tasks} /> */}
      <TasksStack.Screen name="TaskVerification" component={TaskVerification} />
      <TasksStack.Screen name="TaskStart" component={TaskStart} />
      <TasksStack.Screen name="TaskCompelete" component={TaskCompelete} />
    </TasksStack.Navigator>
  );
}

// ✅ Main Tabs
function MainTabs({ setIsLoggedIn }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1e1e1e",
          borderTopColor: "#333",
        },
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: "#999",
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case "Dashboard":
              iconName = "stats-chart-outline";
              break;
            case "Home": // updated route name
              iconName = "home-outline";
              break;
            case "Tasks":
              iconName = "list-outline";
              break;

            case "Profile":
              iconName = "person-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Tasks" component={TaskStackScreen} />
      {/* <Tab.Screen name="Dashboard" component={DashboardScreen} /> */}
      <Tab.Screen name="Profile">
        {() => <Profile setIsLoggedIn={setIsLoggedIn} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// ✅ Root App
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <NavigationContainer>
        {isLoggedIn ? (
          <MainTabs setIsLoggedIn={setIsLoggedIn} />
        ) : (
          <AuthStack setIsLoggedIn={setIsLoggedIn} />
        )}
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    backgroundColor: "#fff",
  },
});
