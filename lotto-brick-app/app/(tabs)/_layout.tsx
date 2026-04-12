import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerTitleAlign: "center" }}>
      <Tabs.Screen name="index" options={{ title: "홈" }} />
      <Tabs.Screen name="game" options={{ title: "게임" }} />
      <Tabs.Screen name="stats" options={{ title: "통계" }} />
      <Tabs.Screen name="favorite" options={{ title: "하트픽" }} />
    </Tabs>
  );
}
